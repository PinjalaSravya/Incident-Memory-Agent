import { detectTelemetryAnomalies } from '@/lib/ml/anomaly';
import { queryMLAnomalyDetection } from '@/lib/ml/client';
import { evaluateRootCauseHypotheses } from '@/lib/ml/evidence';
import { calculateIncidentSimilarity } from '@/lib/ml/similarity';
import { AgentInvestigationResult, HindsightMemory, Incident } from '@/types';
import { GoogleGenAI } from '@google/genai';

const WORKING_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemma-4-26b-a4b-it'];

export function getGeminiConfig() {
  const envKey = process.env.GEMINI_API_KEY?.trim();
  const apiKey = envKey && envKey !== '' 
    ? envKey 
    : 'AQ.Ab8RN6JatR-qhRp3_9QLoTnDob1cRucxB8bYS2UAgeE6JejuvA';

  return {
    apiKey,
    isConfigured: Boolean(apiKey && apiKey.trim() !== ''),
  };
}

export async function checkGeminiHealth(): Promise<{
  configured: boolean;
  status: 'connected' | 'not_configured' | 'error';
  error?: string;
}> {
  const config = getGeminiConfig();
  if (!config.isConfigured) {
    return {
      configured: false,
      status: 'not_configured',
      error: 'GEMINI_API_KEY is missing from environment.',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    let lastErr = '';
    for (const model of WORKING_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: 'Ping',
        });
        if (response.text) {
          return {
            configured: true,
            status: 'connected',
          };
        }
      } catch (err: any) {
        lastErr = err.message || String(err);
      }
    }

    return {
      configured: true,
      status: 'error',
      error: `Gemini API ping failed: ${lastErr}`,
    };
  } catch (err: any) {
    return {
      configured: true,
      status: 'error',
      error: err.message || 'Error initializing Gemini API client.',
    };
  }
}

export async function analyzeIncident({
  incident,
  historicalMemories = [],
  useMemory = false,
  preFetchedMLResult,
}: {
  incident: Incident;
  historicalMemories?: HindsightMemory[];
  useMemory: boolean;
  preFetchedMLResult?: any;
}): Promise<AgentInvestigationResult> {
  const config = getGeminiConfig();

  // 1. RUN REAL ML TELEMETRY ANOMALY DETECTION (IsolationForest on SMD dataset)
  let anomalyAnalysis = detectTelemetryAnomalies(incident);
  const mlResult = preFetchedMLResult !== undefined ? preFetchedMLResult : await queryMLAnomalyDetection(incident);
  if (mlResult) {
    anomalyAnalysis = {
      ...anomalyAnalysis,
      anomalyScore: mlResult.anomaly_score,
      anomalyLevel: mlResult.is_anomaly
        ? mlResult.anomaly_score >= 0.75 ? 'CRITICAL' : 'HIGH'
        : mlResult.anomaly_score >= 0.25 ? 'MODERATE' : 'NORMAL',
      mlModel: mlResult.model,
      machineId: mlResult.machine_id,
      rawScore: mlResult.raw_score,
      decisionScore: mlResult.decision_score,
    };
  }

  // 2. RUN REAL ML COSINE SIMILARITY SCORING FOR RECALLED MEMORIES
  const historicalMatches = useMemory
    ? historicalMemories.map((mem) => calculateIncidentSimilarity(incident, mem))
    : [];

  // Sort memories by calculated similarity
  const memoriesWithCalculatedSimilarity = useMemory
    ? historicalMemories.map((mem, idx) => ({
        ...mem,
        similarityPercentage: historicalMatches[idx]?.similarityPercentage || 0,
        relevanceLabel: historicalMatches[idx]?.similarityLabel || 'Low Similarity',
      }))
    : [];

  // 3. RUN REAL MULTI-HYPOTHESIS EVIDENCE SCORING ENGINE
  const hypotheses = evaluateRootCauseHypotheses(incident, anomalyAnalysis, historicalMatches);
  const primaryHypothesis = hypotheses[0];

  const isColdStart = useMemory && historicalMemories.length === 0;

  // SYSTEM PROMPT FOR GEMINI
  const systemPrompt = `
You are IncidentIQ, an elite SRE Incident Response AI Reasoning Agent.
You explain ML signals, telemetry anomalies, and Hindsight persistent memories.

STRICT AGENT RULES:
1. Explain the ML calculated Anomaly Score (${anomalyAnalysis.anomalyScore}) and primary anomalous metric (${anomalyAnalysis.primaryAnomalyMetric}).
2. ${
    useMemory
      ? historicalMemories.length > 0
        ? `HISTORICAL HINDSIGHT MEMORY IS ACTIVE. Refer to recalled memory ${memoriesWithCalculatedSimilarity[0]?.incidentId} (Calculated Similarity: ${memoriesWithCalculatedSimilarity[0]?.similarityPercentage}%). Explain how past verified fixes apply.`
        : 'HISTORICAL HINDSIGHT MEMORY IS ACTIVE BUT NO RELEVANT MEMORIES WERE RECALLED. You MUST state: "No relevant historical precedent found." Analyze using ONLY current evidence.'
      : 'HISTORICAL HINDSIGHT MEMORY IS DISABLED. You are in Baseline Zero-Knowledge Mode. Provide standard troubleshooting without historical context.'
  }
3. Evaluate the calculated Candidate Hypotheses (Primary: ${primaryHypothesis.title} with Model Evidence Score ${primaryHypothesis.evidenceScore}/100).
4. Never invent or hard-code fake numerical scores.
5. All remediation actions are advisory for human review.
6. Return output STRICTLY as valid JSON matching this schema:

{
  "summary": "Concise summary of incident assessment and ML signals",
  "severity": "${incident.severity}",
  "recommendedActions": ["Action 1", "Action 2"],
  "preventiveActions": ["Preventive 1", "Preventive 2"],
  "memoryExplanation": "${
    isColdStart
      ? 'No relevant historical precedent found.'
      : 'Detailed explanation of how persistent memory informed this diagnosis'
  }",
  "hypothesisExplanations": {
    "${primaryHypothesis.hypothesisId}": "Detailed reasoning for primary hypothesis"
  }
}
`;

  const memoryContextText = useMemory && memoriesWithCalculatedSimilarity.length > 0
    ? `
=== RECALLED HINDSIGHT HISTORICAL MEMORIES ===
${memoriesWithCalculatedSimilarity
  .map(
    (m, i) => `
[Memory #${i + 1}]
Incident ID: ${m.incidentId}
Service: ${m.service}
Calculated Cosine Similarity: ${m.similarityPercentage}% (${m.relevanceLabel})
Symptoms: ${m.symptoms}
Root Cause: ${m.rootCause}
Verified Resolution: ${m.resolution}
`
  )
  .join('\n')}
=============================================
`
    : `=== NO HISTORICAL MEMORIES RECALLED (MEMORY MODE: ${useMemory ? 'ACTIVE - NO MATCHES FOUND' : 'OFF'}) ===`;

  const userPrompt = `
CURRENT INCIDENT:
Incident ID: ${incident.incidentId}
Service: ${incident.service}
Severity: ${incident.severity}
Title: ${incident.title}
Symptoms: ${incident.symptoms}
Error Signature: ${incident.errorSignature}
Recent Deployment: ${incident.recentDeployment || 'None'}

ML ANOMALY ANALYSIS:
Anomaly Score: ${anomalyAnalysis.anomalyScore} (${anomalyAnalysis.anomalyLevel})
Primary Metric: ${anomalyAnalysis.primaryAnomalyMetric}

EVALUATED HYPOTHESES (MODEL SCORES):
${hypotheses
  .map(
    (h) => `
[${h.hypothesisId}] ${h.title} (Evidence Score: ${h.evidenceScore}/100 - ${h.evidenceStrength})
Description: ${h.description}
Supporting Signals: ${h.supportingEvidence.map((s) => s.signalName).join(', ')}
`
  )
  .join('\n')}

${memoryContextText}

Analyze this incident now and output valid JSON only.
`;

  let geminiSummary = '';
  let geminiRecActions = [
    `1. Inspect application pod logs on ${incident.service} using kubectl or log aggregator.`,
    `2. Check CPU, memory, and connection pool allocation metrics.`,
    `3. Verify database latency metrics.`,
  ];
  let geminiPrevActions = [
    `Establish baseline monitoring thresholds for latency P99 and error rates.`,
  ];

  if (config.isConfigured) {
    try {
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      let lastErr = '';

      for (const model of WORKING_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const parsed = JSON.parse((response.text || '').trim());
          if (parsed.summary) geminiSummary = parsed.summary;
          if (parsed.recommendedActions) geminiRecActions = parsed.recommendedActions;
          if (parsed.preventiveActions) geminiPrevActions = parsed.preventiveActions;
          break;
        } catch (e: any) {
          lastErr = e.message;
        }
      }
    } catch (e) {
      // Fall through to structured ML synthesis
    }
  }

  // Construct structured result
  const summaryText = geminiSummary || (
    !useMemory
      ? `Baseline Analysis for ${incident.service}: ML Anomaly Score is ${anomalyAnalysis.anomalyScore} (${anomalyAnalysis.anomalyLevel}). Primary hypothesis ${primaryHypothesis.hypothesisId} scored ${primaryHypothesis.evidenceScore}/100 based on deployment and telemetry signals.`
      : isColdStart
      ? `No relevant historical precedent found in Hindsight persistent bank. ML Anomaly Score is ${anomalyAnalysis.anomalyScore} (${anomalyAnalysis.anomalyLevel}). Primary hypothesis ${primaryHypothesis.hypothesisId} scored ${primaryHypothesis.evidenceScore}/100 based on current evidence.`
      : `Hindsight Memory Recalled ${memoriesWithCalculatedSimilarity[0]?.incidentId} (Calculated Similarity: ${memoriesWithCalculatedSimilarity[0]?.similarityPercentage}%). Primary hypothesis ${primaryHypothesis.hypothesisId} scored ${primaryHypothesis.evidenceScore}/100. Recommended verified resolution: ${memoriesWithCalculatedSimilarity[0]?.resolution}`
  );

  return {
    incident,
    anomalyAnalysis,
    historicalMatches,
    hypotheses,
    hindsightMemory: {
      recalledCount: memoriesWithCalculatedSimilarity.length,
      message: useMemory
        ? memoriesWithCalculatedSimilarity.length > 0
          ? `Recalled ${memoriesWithCalculatedSimilarity.length} memories from Hindsight Cloud.`
          : 'No relevant historical precedent found.'
        : 'Memory OFF',
      memories: memoriesWithCalculatedSimilarity,
      fallbackActive: !config.isConfigured,
    },
    investigation: {
      summary: summaryText,
      severity: incident.severity,
      primaryHypothesis,
      recommendedActions: geminiRecActions,
      preventiveActions: geminiPrevActions,
      memoryUsed: useMemory,
      memoryExplanation: !useMemory
        ? 'Baseline Mode Active: Zero historical context used.'
        : isColdStart
        ? 'No relevant historical precedent found.'
        : `Hindsight Active: Recalled ${memoriesWithCalculatedSimilarity.length} memories. Top match ${memoriesWithCalculatedSimilarity[0]?.incidentId} with calculated Cosine Similarity ${memoriesWithCalculatedSimilarity[0]?.similarityPercentage}%.`,
      modelScoreLabel: `${primaryHypothesis.evidenceScore}/100 (${primaryHypothesis.evidenceStrength})`,
    },
  };
}
