import { SYNTHETIC_INCIDENTS } from '@/data/incidents';
import { retainIncidentMemory } from '@/lib/hindsight';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Seed incidents that have resolutions (historical records, e.g. INC-1042)
    const historicalToSeed = SYNTHETIC_INCIDENTS.filter(
      (inc) => inc.resolution && !inc.resolution.includes('Pending')
    );

    let seededCount = 0;
    let fallbackCount = 0;
    const results = [];

    for (const incident of historicalToSeed) {
      const res = await retainIncidentMemory(incident);
      if (res.success) {
        seededCount++;
        if (res.fallbackActive) fallbackCount++;
      }
      results.push({
        incidentId: incident.incidentId,
        service: incident.service,
        success: res.success,
        fallbackActive: res.fallbackActive,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${seededCount} historical incidents into Hindsight persistent memory bank.`,
      seededCount,
      fallbackCount,
      results,
    });
  } catch (err: any) {
    console.error('Error in /api/demo/seed:', err);
    return NextResponse.json(
      { error: err.message || 'Error seeding demo memories.' },
      { status: 500 }
    );
  }
}
