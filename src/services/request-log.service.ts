/**
 * In-memory request log store for interactive API monitoring
 * Stores recent API requests for real-time dashboard viewing
 * Note: In-memory only — resets on restart. For production, use a persistent store.
 */

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: string;
  ip: string;
  userAgent: string;
  correlationId: string;
  userId?: string;
  requestBody?: any;
  responseStatus: 'success' | 'error';
  errorMessage?: string;
}

interface RequestLogStats {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  requestsPerMinute: number;
  topEndpoints: { path: string; method: string; count: number }[];
  statusCodeDistribution: Record<string, number>;
  recentErrors: RequestLogEntry[];
}

const MAX_LOG_ENTRIES = 500;
const logs: RequestLogEntry[] = [];

/**
 * Add a request log entry
 */
export function addLogEntry(entry: RequestLogEntry): void {
  logs.unshift(entry); // newest first
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.length = MAX_LOG_ENTRIES;
  }
}

/**
 * Get recent request logs with optional filtering
 */
export function getLogs(options: {
  limit?: number;
  method?: string;
  status?: 'success' | 'error';
  path?: string;
  since?: string;
} = {}): RequestLogEntry[] {
  let filtered = [...logs];

  if (options.method) {
    const method = options.method.toUpperCase();
    filtered = filtered.filter(l => l.method === method);
  }
  if (options.status) {
    const status = options.status;
    filtered = filtered.filter(l => l.responseStatus === status);
  }
  if (options.path) {
    const pathFilter = options.path;
    filtered = filtered.filter(l => l.path.includes(pathFilter));
  }
  if (options.since) {
    const sinceDate = new Date(options.since).getTime();
    filtered = filtered.filter(l => new Date(l.timestamp).getTime() >= sinceDate);
  }

  return filtered.slice(0, options.limit || 50);
}

/**
 * Get request statistics for dashboard
 */
export function getStats(): RequestLogStats {
  const now = Date.now();
  const oneMinuteAgo = now - 60_000;

  const recentLogs = logs.filter(l => new Date(l.timestamp).getTime() >= oneMinuteAgo);
  const successLogs = logs.filter(l => l.responseStatus === 'success');
  const errorLogs = logs.filter(l => l.responseStatus === 'error');

  // Calculate average response time
  const durations = logs
    .map(l => parseInt(l.duration, 10))
    .filter(d => !isNaN(d));
  const avgResponseTime = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  // Top endpoints
  const endpointCounts = new Map<string, { path: string; method: string; count: number }>();
  for (const log of logs) {
    const key = `${log.method} ${log.path}`;
    const existing = endpointCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      endpointCounts.set(key, { path: log.path, method: log.method, count: 1 });
    }
  }
  const topEndpoints = Array.from(endpointCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Status code distribution
  const statusCodeDistribution: Record<string, number> = {};
  for (const log of logs) {
    const code = String(log.statusCode);
    statusCodeDistribution[code] = (statusCodeDistribution[code] || 0) + 1;
  }

  return {
    totalRequests: logs.length,
    successCount: successLogs.length,
    errorCount: errorLogs.length,
    avgResponseTime,
    requestsPerMinute: recentLogs.length,
    topEndpoints,
    statusCodeDistribution,
    recentErrors: errorLogs.slice(0, 5),
  };
}

/**
 * Clear all logs
 */
export function clearLogs(): void {
  logs.length = 0;
}
