import { getStoredFallbackMemories, recallRelevantIncidents } from '@/lib/hindsight';
import { MemoryEvolutionNode } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const memories = getStoredFallbackMemories();

    const evolutionGraph: MemoryEvolutionNode[] = [
      {
        incidentId: 'INC-1042',
        service: 'Payment API',
        timestamp: '2026-06-14T09:23:00Z',
        learnedMemoryId: 'mem-INC-1042',
        rootCauseSummary: 'v2.4.1 payment audit logger opened connections outside managed transaction blocks causing pool exhaustion.',
        resolutionSummary: 'Rolled back v2.4.1 to v2.4.0 and increased Hikari maximum pool size to 250.',
        investigationAccelerationPercentage: 0, // Originating incident
      },
      {
        incidentId: 'INC-1097',
        service: 'Payment API',
        timestamp: '2026-09-28T14:15:00Z',
        learnedMemoryId: 'mem-INC-1097',
        recalledPrecedentId: 'INC-1042',
        rootCauseSummary: 'v2.5.0 database audit logger connection leak matching INC-1042 precedent pattern.',
        resolutionSummary: 'Instant rollback to v2.4.0 based on recalled INC-1042 verified fix.',
        investigationAccelerationPercentage: 85, // 85% reduction in mean-time-to-detect
      },
    ];

    return NextResponse.json({
      success: true,
      evolutionNodes: evolutionGraph,
      totalMemoriesInBank: memories.length,
    });
  } catch (err: any) {
    console.error('Error in /api/memory/evolution:', err);
    return NextResponse.json(
      { error: err.message || 'Error retrieving memory evolution graph.' },
      { status: 500 }
    );
  }
}
