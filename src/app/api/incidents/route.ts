import { SYNTHETIC_INCIDENTS } from '@/data/incidents';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    incidents: SYNTHETIC_INCIDENTS,
    total: SYNTHETIC_INCIDENTS.length,
  });
}
