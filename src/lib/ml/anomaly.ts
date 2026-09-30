import { BASELINE_TELEMETRY_DATA, TelemetrySnapshot } from '@/data/training-metrics';
import { Incident, TelemetryAnomalyResult } from '@/types';

export type { TelemetryAnomalyResult };

// Compute feature statistics from the baseline operational dataset
function computeBaselineStats(data: TelemetrySnapshot[]) {
  const keys: (keyof TelemetrySnapshot)[] = [
    'cpuUsage',
    'memoryUsage',
    'errorRate',
    'latencyP99',
    'activeConnectionsRatio',
    'trafficChange',
  ];

  const stats: Record<string, { mean: number; stdDev: number }> = {};

  for (const key of keys) {
    const values = data.map((d) => d[key]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance) || 1.0;
    stats[key] = { mean, stdDev };
  }

  return stats;
}

const BASELINE_STATS = computeBaselineStats(BASELINE_TELEMETRY_DATA);

// Feature weights for ML scoring (higher weight for error rates and connection leaks)
const FEATURE_WEIGHTS: Record<keyof TelemetrySnapshot, number> = {
  errorRate: 2.5,
  activeConnectionsRatio: 2.5,
  latencyP99: 2.0,
  cpuUsage: 1.0,
  memoryUsage: 1.0,
  trafficChange: 1.0,
};

export function parseIncidentMetricsToVector(incident: Incident): TelemetrySnapshot {
  const m = incident.metrics || {};

  // Extract CPU
  const cpuStr = m.cpuUsage || '30%';
  const cpuUsage = parseFloat(cpuStr.replace(/[^0-9.]/g, '')) || 30;

  // Extract Memory
  const memStr = m.memoryUsage || '45%';
  const memoryUsage = parseFloat(memStr.replace(/[^0-9.]/g, '')) || 45;

  // Extract Error Rate
  const errStr = m.errorRate || '0.1%';
  const errorRate = parseFloat(errStr.replace(/[^0-9.]/g, '')) || 0.1;

  // Extract Latency P99
  const latStr = m.latencyP99 || '120ms';
  const latencyP99 = parseFloat(latStr.replace(/[^0-9.]/g, '')) || 120;

  // Extract Active Connections Ratio
  let activeConnectionsRatio = 0.3;
  if (m.activeConnections) {
    const connMatch = m.activeConnections.match(/(\d+)\/(\d+)/);
    if (connMatch) {
      const active = parseFloat(connMatch[1]);
      const max = parseFloat(connMatch[2]);
      if (max > 0) activeConnectionsRatio = active / max;
    } else if (m.activeConnections.toLowerCase().includes('exhausted')) {
      activeConnectionsRatio = 1.0;
    }
  }

  const trafficChange = 5;

  return {
    cpuUsage,
    memoryUsage,
    errorRate,
    latencyP99,
    activeConnectionsRatio,
    trafficChange,
  };
}

export function detectTelemetryAnomalies(incident: Incident): TelemetryAnomalyResult {
  const vector = parseIncidentMetricsToVector(incident);

  let totalWeightedZSquared = 0;
  let totalWeight = 0;
  const contributions: TelemetryAnomalyResult['featureContributions'] = [];

  const featureKeys: (keyof TelemetrySnapshot)[] = [
    'cpuUsage',
    'memoryUsage',
    'errorRate',
    'latencyP99',
    'activeConnectionsRatio',
    'trafficChange',
  ];

  let maxContributionMetric = 'errorRate';
  let maxContributionScore = -1;

  for (const key of featureKeys) {
    const observed = vector[key];
    const { mean, stdDev } = BASELINE_STATS[key];
    const weight = FEATURE_WEIGHTS[key];

    // Standardized Z-Score
    const zScore = (observed - mean) / stdDev;
    const zScoreAbs = Math.abs(zScore);

    // Feature anomaly score (sigmoid scaled per feature)
    const featureScore = 1 / (1 + Math.exp(-0.8 * (zScoreAbs - 2.0)));
    
    totalWeightedZSquared += weight * Math.pow(zScore, 2);
    totalWeight += weight;

    if (featureScore > maxContributionScore) {
      maxContributionScore = featureScore;
      maxContributionMetric = key;
    }

    let observedValueDisplay = `${observed}`;
    if (key === 'cpuUsage' || key === 'memoryUsage' || key === 'errorRate') {
      observedValueDisplay = `${observed.toFixed(1)}%`;
    } else if (key === 'latencyP99') {
      observedValueDisplay = `${observed}ms`;
    } else if (key === 'activeConnectionsRatio') {
      observedValueDisplay = `${(observed * 100).toFixed(0)}% allocated`;
    }

    contributions.push({
      metric: key,
      observedValue: observedValueDisplay,
      baselineValue: `${mean.toFixed(1)} (std: ${stdDev.toFixed(1)})`,
      zScore: parseFloat(zScore.toFixed(2)),
      anomalyContributionScore: parseFloat(featureScore.toFixed(3)),
      isAnomalous: zScoreAbs > 2.0,
    });
  }

  // Distance in feature space
  const mahalanobisDist = Math.sqrt(totalWeightedZSquared / totalWeight);

  // Calibrated Anomaly Score in [0.0, 1.0] using Sigmoid transformation
  const rawAnomalyScore = 2 / (1 + Math.exp(-0.7 * mahalanobisDist)) - 1;
  const anomalyScore = parseFloat(Math.min(Math.max(rawAnomalyScore, 0.0), 1.0).toFixed(3));

  let anomalyLevel: TelemetryAnomalyResult['anomalyLevel'] = 'NORMAL';
  if (anomalyScore >= 0.75) {
    anomalyLevel = 'CRITICAL';
  } else if (anomalyScore >= 0.50) {
    anomalyLevel = 'HIGH';
  } else if (anomalyScore >= 0.25) {
    anomalyLevel = 'MODERATE';
  }

  return {
    anomalyScore,
    anomalyLevel,
    featureContributions: contributions.sort((a, b) => b.anomalyContributionScore - a.anomalyContributionScore),
    primaryAnomalyMetric: maxContributionMetric,
    calculatedAt: new Date().toISOString(),
  };
}
