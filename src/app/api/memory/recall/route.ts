import { getStoredFallbackMemories, recallRelevantIncidents } from '@/lib/hindsight';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, service, topK = 5 } = body;

    if (!query) {
      // If no query, return all stored memories for explorer view
      const allMemories = getStoredFallbackMemories();
      return NextResponse.json({
        memories: allMemories,
        count: allMemories.length,
        fallbackActive: true,
        message: `Retrieved ${allMemories.length} stored memories.`,
      });
    }

    const result = await recallRelevantIncidents(query, service, topK);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error in /api/memory/recall:', err);
    return NextResponse.json(
      { error: err.message || 'Error recalling memories from Hindsight.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const memories = getStoredFallbackMemories();
  return NextResponse.json({
    memories,
    count: memories.length,
    message: `Retrieved ${memories.length} stored memories.`,
  });
}
