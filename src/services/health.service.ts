interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

/**
 * Get application health status
 * Returns comprehensive health information for monitoring and debugging
 * 
 * @returns Health status object with system metrics
 * 
 * Response includes:
 * - status: Overall health status (always 'healthy' for basic check)
 * - timestamp: Current ISO timestamp
 * - uptime: Process uptime in seconds
 * - environment: Current NODE_ENV
 * - version: Application version from package.json
 * - memory: Memory usage statistics (used, total, percentage)
 */
export function getHealthStatus(): HealthStatus {
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()), // Uptime in seconds (rounded)
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: memoryPercentage,
    },
  };
}

/**
 * Format uptime into human-readable string
 * 
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime string (e.g., "2d 5h 30m")
 * 
 * @example
 * formatUptime(90061); // Returns "1d 1h 1m"
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '0m';
}
