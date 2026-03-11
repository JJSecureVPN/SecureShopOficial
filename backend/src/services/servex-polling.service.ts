import EventEmitter from "events";
import axios, { AxiosError } from "axios";
import { ServexService } from "./servex.service";

export interface ServexSnapshot {
  fetchedAt: Date;
  clients: any[];
  source: "polling";
}

interface ServexPollingOptions {
  intervalMs?: number;
  clientsLimit?: number;
  maxBackoffMs?: number;
  jitterMs?: number;
  maxBackoffDurationMs?: number; // Max time to stay in backoff before forcing recovery
  staleDataThresholdMs?: number; // Alert threshold for stale data
}

export class ServexPollingService extends EventEmitter {
  private readonly intervalMs: number;
  private readonly clientsLimit: number;
  private readonly maxBackoffMs: number;
  private readonly maxBackoffDurationMs: number; // e.g. 5 minutes
  private readonly staleDataThresholdMs: number; // e.g. 10 minutes
  private readonly cooldownMultiplier = 2;
  private readonly jitterMs: number;
  private timer: NodeJS.Timeout | null = null;
  private staleDataTimer: NodeJS.Timeout | null = null;
  private running = false;
  private fetching = false;
  private consecutive429 = 0;
  private snapshot: ServexSnapshot | null = null;
  private backoffStartTime: number | null = null; // When backoff started
  private totalConsecutiveErrors = 0; // Track all errors, not just 429s

  constructor(
    private readonly servexService: ServexService,
    options: ServexPollingOptions = {}
  ) {
    super();
    this.intervalMs = options.intervalMs ?? 5000;
    this.clientsLimit = options.clientsLimit ?? 50;
    this.maxBackoffMs = options.maxBackoffMs ?? 30_000;
    this.maxBackoffDurationMs = options.maxBackoffDurationMs ?? 5 * 60 * 1000; // 5 minutes default
    this.staleDataThresholdMs = options.staleDataThresholdMs ?? 10 * 60 * 1000; // 10 minutes default
    this.jitterMs = options.jitterMs ?? 250;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.startStaleDataMonitor();
    this.scheduleNextPoll(0);
  }

  stop(): void {
    this.clearTimer();
    this.clearStaleDataTimer();
    this.running = false;
  }

  getSnapshot(): ServexSnapshot | null {
    return this.snapshot;
  }

  private async poll(): Promise<void> {
    if (!this.running || this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      const clients = await this.servexService.obtenerClientes(
        {
          page: 1,
          limit: this.clientsLimit,
          scope: "meus",
        },
        { forceRefresh: true }
      );

      this.snapshot = {
        clients,
        fetchedAt: new Date(),
        source: "polling",
      };

      this.consecutive429 = 0;
      this.totalConsecutiveErrors = 0;
      this.backoffStartTime = null;
      
      this.emit("snapshot", this.snapshot);
      this.scheduleNextPoll(this.intervalMs);
    } catch (error) {
      this.totalConsecutiveErrors += 1;
      const retryDelay = this.getRetryDelay(error);
      this.emit("error", error);
      
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        this.emit("backoff", {
          delay: retryDelay,
          consecutive429: this.consecutive429,
        });
      }
      
      this.scheduleNextPoll(retryDelay);
    } finally {
      this.fetching = false;
    }
  }

  private scheduleNextPoll(delay: number): void {
    if (!this.running) {
      return;
    }

    // Track when we enter backoff
    if (delay > this.intervalMs && !this.backoffStartTime) {
      this.backoffStartTime = Date.now();
    }

    // If we've been in backoff for too long, force recovery attempt (reset with small delay)
    if (this.backoffStartTime && Date.now() - this.backoffStartTime > this.maxBackoffDurationMs) {
      console.warn(
        `[ServexPolling] ⚠️ Backoff threshold exceeded (${this.maxBackoffDurationMs}ms). Forcing recovery attempt.`
      );
      this.emit("recovery-force", {
        backoffDurationMs: Date.now() - this.backoffStartTime,
        totalErrors: this.totalConsecutiveErrors,
      });
      this.consecutive429 = 0;
      this.totalConsecutiveErrors = 0;
      this.backoffStartTime = null;
      // Force immediate retry instead of extending backoff
      this.clearTimer();
      this.timer = setTimeout(() => this.poll(), 1000 + this.getJitter());
      return;
    }

    this.clearTimer();
    this.timer = setTimeout(() => this.poll(), Math.max(0, delay));
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private clearStaleDataTimer(): void {
    if (this.staleDataTimer) {
      clearTimeout(this.staleDataTimer);
      this.staleDataTimer = null;
    }
  }

  private startStaleDataMonitor(): void {
    this.clearStaleDataTimer();
    this.staleDataTimer = setInterval(() => {
      if (!this.snapshot) {
        return;
      }

      const ageMs = Date.now() - this.snapshot.fetchedAt.getTime();
      if (ageMs > this.staleDataThresholdMs) {
        const now = new Date().toISOString();
        console.warn(
          `[ServexPolling] ⚠️ Data is STALE: ${ageMs}ms old (threshold: ${this.staleDataThresholdMs}ms) [${now}]`
        );
        this.emit("stale-data", {
          ageMs,
          thresholdMs: this.staleDataThresholdMs,
          fetchedAt: this.snapshot.fetchedAt.toISOString(),
          inBackoffMs: this.backoffStartTime ? Date.now() - this.backoffStartTime : null,
          totalErrors: this.totalConsecutiveErrors,
        });

        // Also try to force a recovery poll if we're stuck in backoff
        if (this.totalConsecutiveErrors > 5 && !this.fetching) {
          console.warn("[ServexPolling] 🔄 Forcing recovery poll due to stale data + many errors");
          this.poll().catch((e) => console.error("[ServexPolling] Recovery poll error:", e));
        }
      }
    }, 30_000); // Check every 30 seconds
  }

  private getRetryDelay(error: unknown): number {
    if (axios.isAxiosError(error)) {
      const status = (error as AxiosError).response?.status;
      if (status === 429) {
        this.consecutive429 += 1;
        const headers = (error as AxiosError).response?.headers;
        const retryAfterHeader = headers?.["retry-after"] ?? headers?.["Retry-After"];
        const retryAfterMs = this.parseRetryAfter(retryAfterHeader);

        if (retryAfterMs !== null) {
          return Math.min(retryAfterMs + this.getJitter(), this.maxBackoffMs);
        }

        const exponentialDelay = this.intervalMs * Math.pow(
          this.cooldownMultiplier,
          this.consecutive429
        );
        const boundedDelay = Math.min(
          Math.max(exponentialDelay, this.intervalMs),
          this.maxBackoffMs
        );

        return Math.min(boundedDelay + this.getJitter(), this.maxBackoffMs);
      }
      
      // For other errors (502, 522, timeouts), use moderate backoff but not as aggressive
      this.consecutive429 = 0;
      const baseDelay = this.intervalMs * 2; // 2x normal interval
      return Math.min(baseDelay + this.getJitter(), this.maxBackoffMs);
    }

    this.consecutive429 = 0;
    return this.intervalMs;
  }

  private parseRetryAfter(header: unknown): number | null {
    if (!header) {
      return null;
    }

    if (typeof header === "number") {
      return Math.max(header * 1000, 0);
    }

    const asString = header.toString().trim();
    const numericSeconds = Number(asString);

    if (!Number.isNaN(numericSeconds)) {
      return Math.max(numericSeconds * 1000, 0);
    }

    const parsedDate = Date.parse(asString);
    if (!Number.isNaN(parsedDate)) {
      const diff = parsedDate - Date.now();
      return diff > 0 ? diff : 0;
    }

    return null;
  }

  private getJitter(): number {
    if (this.jitterMs <= 0) {
      return 0;
    }

    return Math.floor(Math.random() * this.jitterMs);
  }
}
