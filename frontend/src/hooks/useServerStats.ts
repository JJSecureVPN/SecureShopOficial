import { useCallback, useEffect, useMemo, useState } from "react";

interface ServerStat {
  serverId?: number;
  serverName: string;
  location: string;
  status: "online" | "offline";
  connectedUsers: number;
  lastUpdate: string;
  // Datos de rendimiento
  cpuUsage?: number;
  memoryUsage?: number;
  cpuCores?: number;
  totalMemoryGb?: number;
  totalUsuarios?: number;
  netRecvMbps?: number;
  netSentMbps?: number;
}

interface ServerStatsData {
  servers: ServerStat[];
  totalUsers: number;
  onlineServers: number;
  loading: boolean;
}

interface ServerStatsRealtimePayload {
  fetchedAt: string;
  totalUsers: number;
  onlineServers: number;
  servers: ServerStat[];
}

export function useServerStats(
  _refreshInterval: number = 6000
): ServerStatsData {
  const [servers, setServers] = useState<ServerStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [onlineServers, setOnlineServers] = useState(0);
  const [loading, setLoading] = useState(true);

  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_API_URL || "/api";
    return raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }, []);

  const snapshotUrl = useMemo(
    () => `${apiBase}/realtime/snapshot`,
    [apiBase]
  );

  const streamUrl = useMemo(
    () => `${apiBase}/realtime/stream`,
    [apiBase]
  );

  const applyPayload = useCallback((payload: ServerStatsRealtimePayload) => {
    const normalizedServers = payload.servers.map((server) => ({
      ...server,
      lastUpdate: server.lastUpdate,
    }));

    setServers(normalizedServers);
    setTotalUsers(payload.totalUsers);
    setOnlineServers(payload.onlineServers);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchSnapshot = async () => {
      try {
        const response = await fetch(snapshotUrl);
        const result = await response.json();
        const payload: ServerStatsRealtimePayload | undefined =
          result?.data?.serverStats;
        if (payload && isMounted) {
          applyPayload(payload);
        }
      } catch (error) {
        console.error("Error fetching server stats snapshot", error);
      }
    };

    fetchSnapshot();

  const eventSource = new EventSource(streamUrl, { withCredentials: false });

    const handleServerStats = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data) as ServerStatsRealtimePayload;
        if (isMounted) {
          applyPayload(payload);
        }
      } catch (error) {
        console.error("Error parsing server-stats event", error);
      }
    };

    const listener = handleServerStats as unknown as EventListener;
    eventSource.addEventListener("server-stats", listener);

    eventSource.onerror = (error) => {
      console.error("Server stats event stream error", error);
    };

    return () => {
      isMounted = false;
      eventSource.removeEventListener("server-stats", listener);
      eventSource.close();
    };
  }, [applyPayload, snapshotUrl, streamUrl]);

  return {
    servers,
    totalUsers,
    onlineServers,
    loading,
  };
}
