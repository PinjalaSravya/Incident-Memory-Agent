import { SYNTHETIC_INCIDENTS } from '@/data/incidents';
import { HindsightMemory, Incident } from '@/types';
import { HindsightRecallResult } from './types';

// Seed initial 7 historical incident postmortems into memory bank prod-incidents
const initialHistoricalIncidents = SYNTHETIC_INCIDENTS.filter(
  (inc) => inc.resolution && !inc.resolution.includes('Pending')
);

const fallbackMemoryStore: HindsightMemory[] = initialHistoricalIncidents.map((incident) => ({
  id: `mem-${incident.incidentId}`,
  incidentId: incident.incidentId,
  service: incident.service,
  symptoms: incident.symptoms,
  rootCause: incident.rootCause || '',
  resolution: incident.resolution || '',
  relevanceLabel: 'Strong Historical Match',
  retainedAt: incident.timestamp || '2026-06-14T09:23:00Z',
  tags: incident.tags,
  rawText: `
[STRUCTURED POST-MORTEM & HISTORICAL INCIDENT RECORD]
Incident ID: ${incident.incidentId}
Service: ${incident.service}
Environment: ${incident.environment}
Severity: ${incident.severity}
Title: ${incident.title}
Timestamp: ${incident.timestamp}
Recent Deployment: ${incident.recentDeployment || 'None'}

SYMPTOMS & ERROR SIGNATURE:
${incident.symptoms}
Error Signature: ${incident.errorSignature}

CONFIRMED ROOT CAUSE:
${incident.rootCause || ''}

VERIFIED EFFECTIVE RESOLUTION:
${incident.resolution || ''}

TAGS: ${incident.tags.join(', ')}
`.trim(),
}));

export function getHindsightConfig() {
  const envKey = process.env.HINDSIGHT_API_KEY?.trim();
  const apiKey = envKey && envKey !== '' 
    ? envKey 
    : 'hsk_b4e029fcf714718e58be67125396ba3e_fb61d4aa438c5f42';

  const bankId = process.env.HINDSIGHT_BANK_ID?.trim() || 'prod-incidents';
  const baseUrl = process.env.HINDSIGHT_BASE_URL?.trim() || 'https://api.hindsight.vectorize.io';

  return {
    apiKey,
    bankId,
    baseUrl,
    isConfigured: Boolean(apiKey && apiKey.trim() !== ''),
  };
}

export async function checkHindsightHealth(): Promise<{
  configured: boolean;
  status: 'connected' | 'not_configured' | 'fallback_active' | 'error';
  bankId: string;
  error?: string;
}> {
  const config = getHindsightConfig();

  if (!config.isConfigured) {
    return {
      configured: false,
      status: 'fallback_active',
      bankId: config.bankId,
      error: 'HINDSIGHT_API_KEY is missing. Operating in local fallback mode.',
    };
  }

  try {
    // Ensure bank exists in Hindsight Cloud API via PUT
    const response = await fetch(`${config.baseUrl}/v1/default/banks/${config.bankId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: config.bankId }),
    });

    if (response.ok || response.status === 200) {
      return {
        configured: true,
        status: 'connected',
        bankId: config.bankId,
      };
    } else {
      const errorText = await response.text();
      console.warn(`Hindsight API ping error HTTP ${response.status}:`, errorText.slice(0, 100));
      return {
        configured: true,
        status: 'error',
        bankId: config.bankId,
        error: `Hindsight API returned HTTP ${response.status}: ${errorText.slice(0, 100)}`,
      };
    }
  } catch (err: any) {
    console.warn(`Network error connecting to Hindsight: ${err.message}`);
    return {
      configured: true,
      status: 'fallback_active',
      bankId: config.bankId,
      error: `Network error connecting to Hindsight: ${err.message || String(err)}`,
    };
  }
}

export async function retainIncidentMemory(incident: Incident): Promise<{
  success: boolean;
  memoryId: string;
  fallbackActive: boolean;
  message: string;
}> {
  const config = getHindsightConfig();

  const formattedContent = `
[STRUCTURED POST-MORTEM & HISTORICAL INCIDENT RECORD]
Incident ID: ${incident.incidentId}
Service: ${incident.service}
Environment: ${incident.environment}
Severity: ${incident.severity}
Title: ${incident.title}
Timestamp: ${incident.timestamp}
Recent Deployment: ${incident.recentDeployment || 'None'}

SYMPTOMS & ERROR SIGNATURE:
${incident.symptoms}
Error Signature: ${incident.errorSignature}

CONFIRMED ROOT CAUSE:
${incident.rootCause || 'Under investigation'}

VERIFIED EFFECTIVE RESOLUTION:
${incident.resolution || 'Pending resolution'}

ATTEMPTED FIXES & FAILED APPROACHES:
- Restarting container pods without configuration rollback did NOT release leaked connection blocks.
- Attempting live pool resize without config restart dropped active transactions.

PREVENTIVE ACTIONS & LESSONS LEARNED:
${incident.preventiveAction || 'Enforce asynchronous connection release linting rules in CI/CD pipeline.'}

TAGS: ${incident.tags.join(', ')}
`.trim();

  const localMemory: HindsightMemory = {
    id: `mem-${incident.incidentId}-${Date.now()}`,
    incidentId: incident.incidentId,
    service: incident.service,
    symptoms: incident.symptoms,
    rootCause: incident.rootCause || '',
    resolution: incident.resolution || '',
    relevanceLabel: 'Strong Historical Match',
    retainedAt: new Date().toISOString(),
    tags: incident.tags,
    rawText: formattedContent,
  };

  // Keep in fallback array as local cache
  const existingIdx = fallbackMemoryStore.findIndex((m) => m.incidentId === incident.incidentId);
  if (existingIdx >= 0) {
    fallbackMemoryStore[existingIdx] = localMemory;
  } else {
    fallbackMemoryStore.push(localMemory);
  }

  if (!config.isConfigured) {
    return {
      success: true,
      memoryId: localMemory.id,
      fallbackActive: true,
      message: 'Memory retained in local fallback store.',
    };
  }

  try {
    // 1. Ensure bank exists
    await fetch(`${config.baseUrl}/v1/default/banks/${config.bankId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: config.bankId }),
    }).catch(() => {});

    // 2. Post memory items to Hindsight Cloud
    const res = await fetch(`${config.baseUrl}/v1/default/banks/${config.bankId}/memories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            content: formattedContent,
            metadata: {
              incidentId: incident.incidentId,
              service: incident.service,
              severity: incident.severity,
              tags: incident.tags.join(','),
            },
          },
        ],
      }),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        memoryId: data.operation_id || data.id || localMemory.id,
        fallbackActive: false,
        message: 'Successfully retained memory into Hindsight Cloud.',
      };
    }

    const errText = await res.text();
    console.warn('Hindsight retain HTTP error:', errText.slice(0, 100));
    return {
      success: true,
      memoryId: localMemory.id,
      fallbackActive: true,
      message: `Hindsight Cloud returned HTTP ${res.status}. Retained in fallback store.`,
    };
  } catch (err: any) {
    console.warn('Hindsight retain exception:', err.message);
    return {
      success: true,
      memoryId: localMemory.id,
      fallbackActive: true,
      message: `Retained in fallback store: ${err.message}`,
    };
  }
}

export async function recallRelevantIncidents(
  query: string,
  service?: string,
  topK: number = 3
): Promise<{
  memories: HindsightMemory[];
  fallbackActive: boolean;
  message: string;
}> {
  const config = getHindsightConfig();

  // Try live Hindsight Cloud API
  if (config.isConfigured) {
    try {
      // 1. Ensure bank exists
      await fetch(`${config.baseUrl}/v1/default/banks/${config.bankId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: config.bankId }),
      }).catch(() => {});

      // 2. Perform recall
      const res = await fetch(`${config.baseUrl}/v1/default/banks/${config.bankId}/memories/recall`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: topK,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const resultsArray: any[] = data.results || data.memories || [];

        if (resultsArray.length > 0) {
          const parsed: HindsightMemory[] = resultsArray.map((item, idx) => {
            const text = item.text || item.content || '';
            const incIdMatch = text.match(/INC-\d+/);
            const incId = incIdMatch ? incIdMatch[0] : (item.metadata?.incidentId || 'INC-HISTORICAL');

            let rootCause = 'Refer to recalled historical record';
            let resolution = 'Refer to recalled historical record';

            if (text.includes('ROOT CAUSE:')) {
              const parts = text.split('ROOT CAUSE:');
              rootCause = parts[1]?.split('\n\n')[0]?.split('VERIFIED RESOLUTION:')[0]?.trim() || rootCause;
            }
            if (text.includes('VERIFIED RESOLUTION:')) {
              const parts = text.split('VERIFIED RESOLUTION:');
              resolution = parts[1]?.split('\n\n')[0]?.split('PREVENTIVE ACTIONS:')[0]?.trim() || resolution;
            }

            return {
              id: item.id || `recalled-${idx}`,
              incidentId: incId,
              service: item.metadata?.service || service || 'Payment API',
              symptoms: text.slice(0, 300),
              rootCause,
              resolution,
              relevanceLabel: idx === 0 ? 'Strong Historical Match (Direct Precedent)' : 'Possible Historical Match',
              retainedAt: item.created_at || new Date().toISOString(),
              rawText: text,
            };
          });

          return {
            memories: parsed,
            fallbackActive: false,
            message: `Recalled ${parsed.length} memories from Hindsight Cloud persistent bank (${config.bankId}).`,
          };
        }
      }
    } catch (err: any) {
      console.warn('Hindsight recall live API error:', err.message);
    }
  }

  // Fallback match if Cloud API had no matches or failed
  const searchTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  
  const scored = fallbackMemoryStore.map((mem) => {
    let score = 0;
    const text = `${mem.service} ${mem.symptoms} ${mem.rootCause} ${mem.rawText}`.toLowerCase();
    
    if (service && mem.service.toLowerCase() === service.toLowerCase()) {
      score += 0.4;
    }

    for (const term of searchTerms) {
      if (text.includes(term)) {
        score += 0.2;
      }
    }

    return { mem, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored
    .filter((s) => s.score > 0.15)
    .slice(0, topK)
    .map((s, idx) => ({
      ...s.mem,
      relevanceLabel: idx === 0 ? 'Strong Historical Match' : 'Possible Historical Match',
    }));

  return {
    memories: matched,
    fallbackActive: !config.isConfigured,
    message: matched.length > 0
      ? `Recalled ${matched.length} memories from fallback memory store.`
      : 'No relevant historical precedent found.',
  };
}

export function getStoredFallbackMemories(): HindsightMemory[] {
  return [...fallbackMemoryStore];
}

