import { retainIncidentMemory } from '@/lib/hindsight';
import { Incident } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { incident }: { incident: Incident } = body;

    if (!incident || !incident.incidentId) {
      return NextResponse.json(
        { error: 'Incident object with incidentId is required for memory retention.' },
        { status: 400 }
      );
    }

    const result = await retainIncidentMemory(incident);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/memory/retain:', err);
    return NextResponse.json(
      { error: err.message || 'Error retaining memory into Hindsight.' },
      { status: 500 }
    );
  }
}
