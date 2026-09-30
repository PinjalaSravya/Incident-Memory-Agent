import { HindsightMemory, Incident } from '@/types';

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

// Tokenize and clean text into normalized term frequencies
function extractTermFrequencyVector(text: string): Map<string, number> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}

// Compute Cosine Similarity between two term frequency vectors
export function computeCosineSimilarity(
  vecA: Map<string, number>,
  vecB: Map<string, number>
): { cosineSimilarity: number; matchedTokens: string[] } {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const matchedTokens: string[] = [];

  for (const [term, countA] of vecA.entries()) {
    normA += countA * countA;
    if (vecB.has(term)) {
      const countB = vecB.get(term)!;
      dotProduct += countA * countB;
      matchedTokens.push(term);
    }
  }

  for (const countB of vecB.values()) {
    normB += countB * countB;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return { cosineSimilarity: 0.0, matchedTokens: [] };
  }

  const cosineSimilarity = dotProduct / (normA * normB);
  return {
    cosineSimilarity: parseFloat(Math.min(Math.max(cosineSimilarity, 0.0), 1.0).toFixed(4)),
    matchedTokens,
  };
}

export function calculateIncidentSimilarity(
  currentIncident: Incident,
  historicalMemory: HindsightMemory
): IncidentSimilarityResult {
  // Construct text blocks for target comparisons
  const currentSymptomsText = `${currentIncident.title} ${currentIncident.symptoms}`;
  const currentErrorText = `${currentIncident.errorSignature} ${currentIncident.tags.join(' ')}`;

  const historicalText = `${historicalMemory.symptoms} ${historicalMemory.rootCause} ${historicalMemory.resolution} ${historicalMemory.rawText || ''}`;
  const historicalErrorText = `${historicalMemory.symptoms} ${historicalMemory.tags?.join(' ') || ''}`;

  // Term vectors
  const currentSymVec = extractTermFrequencyVector(currentSymptomsText);
  const histSymVec = extractTermFrequencyVector(historicalText);

  const currentErrVec = extractTermFrequencyVector(currentErrorText);
  const histErrVec = extractTermFrequencyVector(historicalErrorText);

  const symResult = computeCosineSimilarity(currentSymVec, histSymVec);
  const errResult = computeCosineSimilarity(currentErrVec, histErrVec);

  const serviceMatch = currentIncident.service.toLowerCase() === historicalMemory.service.toLowerCase();

  // Weighted multi-aspect Cosine Similarity calculation
  let combinedSimilarity = 0.5 * symResult.cosineSimilarity + 0.3 * errResult.cosineSimilarity;
  if (serviceMatch) {
    combinedSimilarity += 0.2;
  }

  // Cap at 0.98 unless exact same incident ID
  if (currentIncident.incidentId === historicalMemory.incidentId) {
    combinedSimilarity = 1.0;
  } else {
    combinedSimilarity = Math.min(combinedSimilarity, 0.96);
  }

  const similarityPercentage = parseFloat((combinedSimilarity * 100).toFixed(1));

  let similarityLabel: IncidentSimilarityResult['similarityLabel'] = 'Low Similarity';
  if (similarityPercentage >= 75.0) {
    similarityLabel = 'Strong Historical Match';
  } else if (similarityPercentage >= 45.0) {
    similarityLabel = 'Moderate Historical Match';
  }

  const allMatchedTokens = Array.from(
    new Set([...symResult.matchedTokens, ...errResult.matchedTokens])
  );

  return {
    historicalIncidentId: historicalMemory.incidentId,
    historicalService: historicalMemory.service,
    cosineSimilarity: combinedSimilarity,
    similarityPercentage,
    similarityLabel,
    matchedTokens: allMatchedTokens,
    symptomSimilarity: parseFloat((symResult.cosineSimilarity * 100).toFixed(1)),
    errorSignatureSimilarity: parseFloat((errResult.cosineSimilarity * 100).toFixed(1)),
    serviceMatch,
  };
}
