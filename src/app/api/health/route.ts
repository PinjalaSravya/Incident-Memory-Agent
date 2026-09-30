import { checkGeminiHealth } from '@/lib/gemini';
import { checkHindsightHealth } from '@/lib/hindsight';
import { detectTelemetryAnomalies } from '@/lib/ml/anomaly';
import { SYNTHETIC_INCIDENTS } from '@/data/incidents';
import { NextResponse } from 'next/server';

export async function GET() {
  const geminiStatus = await checkGeminiHealth();
  const hindsightStatus = await checkHindsightHealth();

  const mlApiUrl = process.env.ML_API_URL || process.env.NEXT_PUBLIC_ML_API_URL || 'http://127.0.0.1:8000';

  let mlStatus: {
    status: 'connected' | 'offline';
    algorithm: string;
    trainedMachinesCount: number;
    mode: 'fastapi' | 'in_process';
  } = {
    status: 'offline',
    algorithm: 'IsolationForest',
    trainedMachinesCount: 28,
    mode: 'in_process',
  };

  try {
    // 1. Check FastAPI ML HTTP endpoint
    const mlRes = await fetch(`${mlApiUrl}/health`, { cache: 'no-store' });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      mlStatus = {
        status: 'connected',
        algorithm: mlData.algorithm || 'IsolationForest',
        trainedMachinesCount: mlData.trained_machines_count || 28,
        mode: 'fastapi',
      };
    } else {
      // 2. Fallback to in-process IsolationForest SMD anomaly engine
      const testScoring = detectTelemetryAnomalies(SYNTHETIC_INCIDENTS[0]);
      if (testScoring && typeof testScoring.anomalyScore === 'number') {
        mlStatus = {
          status: 'connected',
          algorithm: 'IsolationForest (SMD Engine)',
          trainedMachinesCount: 28,
          mode: 'in_process',
        };
      }
    }
  } catch (e) {
    // If FastAPI daemon is offline, test the in-process IsolationForest SMD telemetry engine
    try {
      const testScoring = detectTelemetryAnomalies(SYNTHETIC_INCIDENTS[0]);
      if (testScoring && typeof testScoring.anomalyScore === 'number') {
        mlStatus = {
          status: 'connected',
          algorithm: 'IsolationForest (SMD Engine)',
          trainedMachinesCount: 28,
          mode: 'in_process',
        };
      }
    } catch (err) {
      mlStatus = {
        status: 'offline',
        algorithm: 'None',
        trainedMachinesCount: 0,
        mode: 'in_process',
      };
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    gemini: geminiStatus,
    hindsight: hindsightStatus,
    ml: mlStatus,
  });
}

