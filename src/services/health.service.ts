interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}

/**
 * Get application health status
 * Returns basic health information without checking external dependencies
 */
export function getHealthStatus(): HealthStatus {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Uptime in seconds
  };
}
