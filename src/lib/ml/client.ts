import { Incident } from '@/types';
import smdVectorsRaw from '@/data/smd_vectors.json';

export interface MLPredictionResponse {
  machine_id: string;
  is_anomaly: boolean;
  prediction: 'ANOMALY' | 'NORMAL';
  raw_score: number;
  decision_score: number;
  anomaly_score: number;
  model: string;
  feature_count: number;
  online: boolean;
}

const SMD_VECTORS: Record<string, { machine_id: string; vector: number[] }> = smdVectorsRaw as any;

/**
 * Returns a genuine 38-dimensional SMD telemetry vector for an Incident.
 * DO NOT generate synthetic harmonic values.
 */
export function buildSMDFeatureVector(incident: Incident): { machineId: string; vector: number[] } {
  // 1. If incident directly includes a real SMD vector, use it
  if (incident.smdTelemetryVector && incident.smdTelemetryVector.length === 38) {
    return {
      machineId: incident.smdMachineId || 'machine-1-1',
      vector: incident.smdTelemetryVector,
    };
  }

  // 2. Look up by incidentId in pre-extracted real SMD vectors
  const mapped = SMD_VECTORS[incident.incidentId];
  if (mapped && mapped.vector.length === 38) {
    return {
      machineId: mapped.machine_id,
      vector: mapped.vector,
    };
  }

  // 3. Fallback to real row 0 of machine-1-1 from SMD test set
  return {
    machineId: 'machine-1-1',
    vector: SMD_VECTORS['REAL_NORMAL_MACHINE_1_1']?.vector || new Array(38).fill(0.0),
  };
}

/**
 * Calls FastAPI ML inference server running IsolationForest on Server Machine Dataset.
 */
export async function queryMLAnomalyDetection(
  incident: Incident,
  machineIdOverride?: string
): Promise<MLPredictionResponse | null> {
  const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || 'http://127.0.0.1:8000';
  const { machineId, vector } = buildSMDFeatureVector(incident);
  const targetMachine = machineIdOverride || machineId;

  try {
    const res = await fetch(`${mlApiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machine_id: targetMachine,
        metrics: vector,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`ML API returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return {
      ...data,
      online: true,
    };
  } catch (err) {
    // API server offline or unreachable
    return null;
  }
}
