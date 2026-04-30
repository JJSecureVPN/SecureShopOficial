import EventEmitter from "events";
import type { ServexSnapshot } from "./servex-polling.service";
import type { ServerStats } from "./websocket.service";

export type RealtimeEventType = "clients" | "server-stats";

export interface ClientsRealtimePayload {
  fetchedAt: string;
  clients: any[];
  source: "polling";
}

export interface ServerStatsRealtimePayload {
  fetchedAt: string;
  totalUsers: number;
  onlineServers: number;
  servers: Array<Omit<ServerStats, "lastUpdate"> & { lastUpdate: string }>;
}

export type RealtimeEvent = {
  type: RealtimeEventType;
  payload: ClientsRealtimePayload | ServerStatsRealtimePayload;
};

export interface RealtimeState {
  clients?: ClientsRealtimePayload;
  serverStats?: ServerStatsRealtimePayload;
}

export class RealtimeService extends EventEmitter {
  private state: RealtimeState = {};

  getState(): RealtimeState {
    return this.state;
  }

  updateClients(snapshot: ServexSnapshot): void {
    const payload: ClientsRealtimePayload = {
      fetchedAt: snapshot.fetchedAt.toISOString(),
      clients: snapshot.clients,
      source: snapshot.source,
    };

    this.state = {
      ...this.state,
      clients: payload,
    };

    this.emit("update", {
      type: "clients",
      payload,
    } satisfies RealtimeEvent);
  }

  updateServerStats(stats: ServerStats[]): void {
    const totalUsers = stats.reduce((acc, server) => acc + (server.connectedUsers ?? 0), 0);
    const onlineServers = stats.filter((server) => server.status === "online").length;

    const payload: ServerStatsRealtimePayload = {
      fetchedAt: new Date().toISOString(),
      totalUsers,
      onlineServers,
      servers: stats.map((server) => ({
        ...server,
        lastUpdate: server.lastUpdate.toISOString(),
      })),
    };

    this.state = {
      ...this.state,
      serverStats: payload,
    };

    this.emit("update", {
      type: "server-stats",
      payload,
    } satisfies RealtimeEvent);
  }
}
