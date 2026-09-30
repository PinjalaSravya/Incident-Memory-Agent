export interface TelemetrySnapshot {
  cpuUsage: number; // %
  memoryUsage: number; // %
  errorRate: number; // %
  latencyP99: number; // ms
  activeConnectionsRatio: number; // 0.0 to 1.0
  trafficChange: number; // %
}

// Operational Baseline Telemetry Dataset representing healthy system state
export const BASELINE_TELEMETRY_DATA: TelemetrySnapshot[] = [
  { cpuUsage: 25, memoryUsage: 42, errorRate: 0.1, latencyP99: 120, activeConnectionsRatio: 0.25, trafficChange: 5 },
  { cpuUsage: 28, memoryUsage: 45, errorRate: 0.2, latencyP99: 140, activeConnectionsRatio: 0.30, trafficChange: -2 },
  { cpuUsage: 30, memoryUsage: 44, errorRate: 0.0, latencyP99: 110, activeConnectionsRatio: 0.28, trafficChange: 8 },
  { cpuUsage: 22, memoryUsage: 40, errorRate: 0.1, latencyP99: 105, activeConnectionsRatio: 0.22, trafficChange: 0 },
  { cpuUsage: 35, memoryUsage: 48, errorRate: 0.3, latencyP99: 160, activeConnectionsRatio: 0.35, trafficChange: 12 },
  { cpuUsage: 27, memoryUsage: 43, errorRate: 0.1, latencyP99: 125, activeConnectionsRatio: 0.26, trafficChange: 3 },
  { cpuUsage: 32, memoryUsage: 46, errorRate: 0.2, latencyP99: 150, activeConnectionsRatio: 0.32, trafficChange: -5 },
  { cpuUsage: 24, memoryUsage: 41, errorRate: 0.0, latencyP99: 115, activeConnectionsRatio: 0.24, trafficChange: 2 },
  { cpuUsage: 29, memoryUsage: 45, errorRate: 0.1, latencyP99: 130, activeConnectionsRatio: 0.29, trafficChange: 6 },
  { cpuUsage: 31, memoryUsage: 47, errorRate: 0.2, latencyP99: 145, activeConnectionsRatio: 0.31, trafficChange: -1 },
  { cpuUsage: 26, memoryUsage: 42, errorRate: 0.0, latencyP99: 118, activeConnectionsRatio: 0.27, trafficChange: 4 },
  { cpuUsage: 33, memoryUsage: 49, errorRate: 0.3, latencyP99: 155, activeConnectionsRatio: 0.34, trafficChange: 10 },
  { cpuUsage: 23, memoryUsage: 39, errorRate: 0.1, latencyP99: 108, activeConnectionsRatio: 0.23, trafficChange: -3 },
  { cpuUsage: 34, memoryUsage: 48, errorRate: 0.2, latencyP99: 152, activeConnectionsRatio: 0.33, trafficChange: 7 },
  { cpuUsage: 28, memoryUsage: 44, errorRate: 0.1, latencyP99: 122, activeConnectionsRatio: 0.28, trafficChange: 1 },
];
