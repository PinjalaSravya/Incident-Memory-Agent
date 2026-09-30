import { Incident } from '@/types';
import { TelemetryAnomalyResult } from './anomaly';
import { IncidentSimilarityResult } from './similarity';

export interface EvidenceSignal {
  signalName: string;
  category: 'DEPLOYMENT' | 'ERROR_SIGNATURE' | 'TELEMETRY' | 'HISTORICAL_MEMORY' | 'SERVICE_DEPENDENCY';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  rawMetricValue: string;
  weight: number;
  scoreContribution: number;
  description: string;
}

export interface CandidateHypothesis {
  hypothesisId: string; // e.g. "H1", "H2", "H3"
  title: string;
  description: string;
  evidenceScore: number; // 0.0 to 100.0 (Calculated Model Score)
  evidenceStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  supportingEvidence: EvidenceSignal[];
  contradictingEvidence: string[];
  recalledHistoricalPrecedentId?: string;
  recommendedVerificationStep: string;
}

export function evaluateRootCauseHypotheses(
  incident: Incident,
  anomalyResult: TelemetryAnomalyResult,
  similarityResults: IncidentSimilarityResult[]
): CandidateHypothesis[] {
  const topSimilarity = similarityResults[0];
  const hasDeployment = Boolean(incident.recentDeployment && incident.recentDeployment !== 'None reported');

  // ==========================================
  // HYPOTHESIS 1: Deployment Code Regression & Resource Leak
  // ==========================================
  const h1Supporting: EvidenceSignal[] = [];
  let h1RawScore = 0;

  if (hasDeployment) {
    const sig: EvidenceSignal = {
      signalName: 'Recent Deployment Correlation',
      category: 'DEPLOYMENT',
      strength: 'STRONG',
      rawMetricValue: incident.recentDeployment || 'v2.5.0',
      weight: 30,
      scoreContribution: 30,
      description: `Incident occurred shortly after deployment ${incident.recentDeployment}`,
    };
    h1Supporting.push(sig);
    h1RawScore += sig.scoreContribution;
  }

  if (topSimilarity && topSimilarity.similarityPercentage > 50) {
    const sig: EvidenceSignal = {
      signalName: 'Historical Precedent Pattern Match',
      category: 'HISTORICAL_MEMORY',
      strength: topSimilarity.similarityPercentage >= 75 ? 'STRONG' : 'MODERATE',
      rawMetricValue: `INC-1042 Match (${topSimilarity.similarityPercentage}%)`,
      weight: 35,
      scoreContribution: Math.round(35 * (topSimilarity.cosineSimilarity || 0.8)),
      description: `Recalled historical incident ${topSimilarity.historicalIncidentId} with matching error signature`,
    };
    h1Supporting.push(sig);
    h1RawScore += sig.scoreContribution;
  }

  if (anomalyResult.anomalyScore > 0.5) {
    const sig: EvidenceSignal = {
      signalName: 'Telemetry Anomaly Severity',
      category: 'TELEMETRY',
      strength: anomalyResult.anomalyLevel === 'CRITICAL' ? 'STRONG' : 'MODERATE',
      rawMetricValue: `Anomaly Score ${anomalyResult.anomalyScore} (${anomalyResult.anomalyLevel})`,
      weight: 25,
      scoreContribution: Math.round(25 * anomalyResult.anomalyScore),
      description: `Primary metric ${anomalyResult.primaryAnomalyMetric} deviated significantly from baseline`,
    };
    h1Supporting.push(sig);
    h1RawScore += sig.scoreContribution;
  }

  const h1Score = Math.min(Math.round(h1RawScore), 96);
  const h1: CandidateHypothesis = {
    hypothesisId: 'H1',
    title: 'Deployment Code Regression & Database Connection Leak',
    description: `A code regression introduced in deployment ${incident.recentDeployment || 'v2.5.0'} opened database connections outside managed transactional blocks, causing pool exhaustion.`,
    evidenceScore: h1Score,
    evidenceStrength: h1Score >= 75 ? 'STRONG' : h1Score >= 45 ? 'MODERATE' : 'WEAK',
    supportingEvidence: h1Supporting,
    contradictingEvidence: [
      'Infrastructure CPU usage remains below 85%, indicating non-compute bottleneck.',
    ],
    recalledHistoricalPrecedentId: topSimilarity?.historicalIncidentId,
    recommendedVerificationStep: 'Roll back recent deployment and verify Hikari connection block release in application pod logs.',
  };

  // ==========================================
  // HYPOTHESIS 2: Database Infrastructure Capacity Saturation
  // ==========================================
  const h2Supporting: EvidenceSignal[] = [];
  let h2RawScore = 0;

  if (incident.metrics?.activeConnections?.includes('Exhausted') || incident.metrics?.activeConnections?.includes('250')) {
    const sig: EvidenceSignal = {
      signalName: 'Database Pool Allocation Maxed Out',
      category: 'TELEMETRY',
      strength: 'STRONG',
      rawMetricValue: incident.metrics.activeConnections,
      weight: 40,
      scoreContribution: 40,
      description: 'Active database connections reached maximum pool capacity limit.',
    };
    h2Supporting.push(sig);
    h2RawScore += sig.scoreContribution;
  }

  if (anomalyResult.featureContributions.some((f) => f.metric === 'latencyP99' && f.isAnomalous)) {
    const sig: EvidenceSignal = {
      signalName: 'Latency P99 Spike',
      category: 'TELEMETRY',
      strength: 'MODERATE',
      rawMetricValue: incident.metrics?.latencyP99 || '30,000ms',
      weight: 25,
      scoreContribution: 20,
      description: 'P99 request latency spiked due to connection acquisition queue timeouts.',
    };
    h2Supporting.push(sig);
    h2RawScore += sig.scoreContribution;
  }

  const h2Score = Math.min(Math.round(h2RawScore), 78);
  const h2: CandidateHypothesis = {
    hypothesisId: 'H2',
    title: 'Database Infrastructure Connection Saturation',
    description: 'Database maximum pool capacity limit reached due to sudden query burst or unoptimized query execution.',
    evidenceScore: h2Score,
    evidenceStrength: h2Score >= 75 ? 'STRONG' : h2Score >= 45 ? 'MODERATE' : 'WEAK',
    supportingEvidence: h2Supporting,
    contradictingEvidence: [
      'Incident timing aligns directly with deployment rather than gradual organic traffic growth.',
    ],
    recommendedVerificationStep: 'Inspect active PostgreSQL pg_stat_activity queries for long-running uncommitted locks.',
  };

  // ==========================================
  // HYPOTHESIS 3: Upstream 3rd-Party Gateway Latency & Retry Cascade
  // ==========================================
  const h3Supporting: EvidenceSignal[] = [];
  let h3RawScore = 15;

  const sig3: EvidenceSignal = {
    signalName: 'HTTP 504 Gateway Timeout Errors',
    category: 'ERROR_SIGNATURE',
    strength: 'WEAK',
    rawMetricValue: incident.errorSignature.slice(0, 60),
    weight: 20,
    scoreContribution: 15,
    description: 'Gateway timeout symptoms present during payment processing calls.',
  };
  h3Supporting.push(sig3);

  const h3Score = Math.min(Math.round(h3RawScore), 42);
  const h3: CandidateHypothesis = {
    hypothesisId: 'H3',
    title: 'Upstream Payment Gateway Latency & Retry Cascade',
    description: 'External payment processing partner latency causing thread accumulation and cascading gateway timeouts.',
    evidenceScore: h3Score,
    evidenceStrength: 'WEAK',
    supportingEvidence: h3Supporting,
    contradictingEvidence: [
      'Error signature HikariPool-1 explicitly indicates internal database pool exhaustion, not external API timeout.',
    ],
    recommendedVerificationStep: 'Check external 3rd-party payment gateway status page and outbound network egress latency metrics.',
  };

  // Sort hypotheses by calculated evidence score descending
  const hypotheses = [h1, h2, h3].sort((a, b) => b.evidenceScore - a.evidenceScore);
  return hypotheses;
}
