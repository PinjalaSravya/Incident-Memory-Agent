export type SeverityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export interface Incident {
  incidentId: string;
  timestamp: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  severity: SeverityLevel;
  title: string;
  symptoms: string;
  errorSignature: string;
  metrics?: {
    cpuUsage?: string;
    memoryUsage?: string;
    errorRate?: string;
    latencyP99?: string;
    activeConnections?: string;
  };
  smdTelemetryVector?: number[];
  smdMachineId?: string;
  recentDeployment?: string;
  rootCause?: string;
  resolution?: string;
  preventiveAction?: string;
  tags: string[];
}

export interface HindsightMemory {
  id: string;
  incidentId: string;
  service: string;
  symptoms: string;
  rootCause: string;
  resolution: string;
  relevanceScore?: number;
  relevanceLabel?: string;
  similarityPercentage?: number; // Calculated Cosine Similarity %
  retainedAt: string;
  tags?: string[];
  rawText?: string;
  attemptedFixes?: string;
  failedApproaches?: string;
  lessonsLearned?: string;
}

export interface StructuredPostMortem {
  incidentId: string;
  service: string;
  symptoms: string;
  telemetryCharacteristics: string;
  rootCause: string;
  attemptedFixes: string;
  successfulFix: string;
  failedApproaches: string;
  deploymentInformation: string;
  impact: string;
  resolutionTimeMinutes: number;
  verificationResult: string;
  lessonsLearned: string;
}

export interface TelemetryAnomalyResult {
  anomalyScore: number; // 0.00 to 1.00 (Calculated ML Anomaly Score)
  anomalyLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL';
  featureContributions: {
    metric: string;
    observedValue: string;
    baselineValue: string;
    zScore: number;
    anomalyContributionScore: number;
    isAnomalous: boolean;
  }[];
  primaryAnomalyMetric: string;
  calculatedAt: string;
  mlModel?: string;
  machineId?: string;
  rawScore?: number;
  decisionScore?: number;
}

export interface IncidentSimilarityResult {
  historicalIncidentId: string;
  historicalService: string;
  cosineSimilarity: number; // 0.000 to 1.000
  similarityPercentage: number; // 0.0% to 100.0%
  similarityLabel: 'Strong Historical Match' | 'Moderate Historical Match' | 'Low Similarity';
  matchedTokens: string[];
  symptomSimilarity: number;
  errorSignatureSimilarity: number;
  serviceMatch: boolean;
}

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
  hypothesisId: string; // "H1", "H2", "H3"
  title: string;
  description: string;
  evidenceScore: number; // 0.0 to 100.0 (Calculated Model Score)
  evidenceStrength: 'STRONG' | 'MODERATE' | 'WEAK';
  supportingEvidence: EvidenceSignal[];
  contradictingEvidence: string[];
  recalledHistoricalPrecedentId?: string;
  recommendedVerificationStep: string;
}

export interface MemoryEvolutionNode {
  incidentId: string;
  service: string;
  timestamp: string;
  learnedMemoryId: string;
  recalledPrecedentId?: string;
  rootCauseSummary: string;
  resolutionSummary: string;
  investigationAccelerationPercentage: number;
}

export interface AgentAnalysis {
  summary: string;
  severity: SeverityLevel;
  likelyRootCause: string;
  confidence: number;
  confidenceLabel?: string;
  evidence: string[];
  recommendedActions: string[];
  preventiveActions: string[];
  relatedIncidents: {
    incidentId: string;
    title: string;
    relevanceReason: string;
    relevanceLabel?: string;
  }[];
  memoryUsed: boolean;
  memoryExplanation: string;
  recalledMemories?: HindsightMemory[];
  fallbackActive?: boolean;
  anomalyAnalysis?: TelemetryAnomalyResult;
  hypotheses?: CandidateHypothesis[];
}

export interface AgentInvestigationResult {
  incident: Incident;
  anomalyAnalysis: TelemetryAnomalyResult;
  historicalMatches: IncidentSimilarityResult[];
  hypotheses: CandidateHypothesis[];
  hindsightMemory: {
    recalledCount: number;
    message: string;
    memories: HindsightMemory[];
    fallbackActive: boolean;
  };
  investigation: {
    summary: string;
    severity: SeverityLevel;
    primaryHypothesis: CandidateHypothesis;
    recommendedActions: string[];
    preventiveActions: string[];
    memoryUsed: boolean;
    memoryExplanation: string;
    modelScoreLabel: string;
  };
}

export interface HealthStatus {
  gemini: {
    configured: boolean;
    status: 'connected' | 'not_configured' | 'error';
    error?: string;
  };
  hindsight: {
    configured: boolean;
    status: 'connected' | 'not_configured' | 'fallback_active' | 'error';
    bankId: string;
    error?: string;
  };
  ml?: {
    status: 'connected' | 'offline';
    algorithm?: string;
    trainedMachinesCount?: number;
  };
}
