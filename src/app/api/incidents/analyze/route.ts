import { analyzeIncident } from '@/lib/gemini';
import { recallRelevantIncidents } from '@/lib/hindsight';
import { queryMLAnomalyDetection } from '@/lib/ml/client';
import { Incident } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { incident, useMemory = true }: { incident: Incident; useMemory?: boolean } = body;

    if (!incident || !incident.incidentId || !incident.symptoms) {
      return NextResponse.json(
        { error: 'Invalid payload: incident object with incidentId and symptoms is required.' },
        { status: 400 }
      );
    }

    // CONCURRENT PERFORMANCE OPTIMIZATION: Run Hindsight Memory Recall and ML Anomaly Inference in parallel
    const [recallResult, mlResult] = await Promise.all([
      useMemory
        ? recallRelevantIncidents(
            `${incident.title} ${incident.symptoms} ${incident.errorSignature}`,
            incident.service,
            3
          )
        : Promise.resolve({ memories: [], fallbackActive: false }),
      queryMLAnomalyDetection(incident),
    ]);

    const recalledMemories = recallResult.memories || [];

    const investigationResult = await analyzeIncident({
      incident,
      historicalMemories: recalledMemories,
      useMemory,
      preFetchedMLResult: mlResult,
    });

    const totalDurationMs = Date.now() - startTime;

    // Adapt for UI component compatibility while providing clean API structure
    const legacyAnalysisObj = {
      summary: investigationResult.investigation.summary,
      severity: investigationResult.investigation.severity,
      likelyRootCause: `[${investigationResult.investigation.primaryHypothesis.hypothesisId}] ${investigationResult.investigation.primaryHypothesis.title}: ${investigationResult.investigation.primaryHypothesis.description}`,
      confidence: Math.round(investigationResult.investigation.primaryHypothesis.evidenceScore),
      confidenceLabel: `Model Score: ${investigationResult.investigation.primaryHypothesis.evidenceScore}/100 (${investigationResult.investigation.primaryHypothesis.evidenceStrength})`,
      evidence: [
        `📊 ML Telemetry Anomaly Score: ${investigationResult.anomalyAnalysis.anomalyScore} (${investigationResult.anomalyAnalysis.anomalyLevel})`,
        `🔍 Primary Anomalous Feature: ${investigationResult.anomalyAnalysis.primaryAnomalyMetric}`,
        ...investigationResult.investigation.primaryHypothesis.supportingEvidence.map((s) => `• ${s.signalName}: ${s.rawMetricValue} (${s.description})`),
      ],
      recommendedActions: investigationResult.investigation.recommendedActions,
      preventiveActions: investigationResult.investigation.preventiveActions,
      relatedIncidents: investigationResult.historicalMatches.map((m) => ({
        incidentId: m.historicalIncidentId,
        title: `Historical Incident ${m.historicalIncidentId} (${m.historicalService})`,
        relevanceReason: `Calculated Cosine Similarity: ${m.similarityPercentage}% (${m.similarityLabel}). Matched tokens: ${m.matchedTokens.slice(0, 4).join(', ')}`,
        relevanceLabel: `Cosine Similarity: ${m.similarityPercentage}%`,
      })),
      memoryUsed: useMemory,
      memoryExplanation: investigationResult.investigation.memoryExplanation,
      recalledMemories: investigationResult.hindsightMemory.memories,
      fallbackActive: investigationResult.hindsightMemory.fallbackActive,
      anomalyAnalysis: investigationResult.anomalyAnalysis,
      hypotheses: investigationResult.hypotheses,
      executionTimeMs: totalDurationMs,
    };

    return NextResponse.json({
      success: true,
      result: investigationResult,
      analysis: legacyAnalysisObj,
      executionTimeMs: totalDurationMs,
    });
  } catch (err: any) {
    console.error('Error in /api/incidents/analyze:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error analyzing incident.' },
      { status: 500 }
    );
  }
}
