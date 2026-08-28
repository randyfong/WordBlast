import { NextResponse } from 'next/server';
import { dualDB } from '@/lib/db/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId = 'stu_player_1',
      studentName = 'Player 1',
      word,
      phonicsPattern,
      categoryLabel,
      latencyMs,
      hesitationMs,
      accuracyScore = 1.0,
      scaffoldTriggered = false,
      timeGapToPhonemeMs = 45
    } = body;

    if (!word || !phonicsPattern) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const recorded = dualDB.insertTelemetry({
      studentId,
      studentName,
      word,
      phonicsPattern,
      categoryLabel: categoryLabel || phonicsPattern,
      latencyMs: Number(latencyMs) || 0,
      hesitationMs: Number(hesitationMs) || 0,
      accuracyScore: Number(accuracyScore) || 1.0,
      scaffoldTriggered: Boolean(scaffoldTriggered),
      timeGapToPhonemeMs: Number(timeGapToPhonemeMs) || 45
    });

    return NextResponse.json({ success: true, event: recorded });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = dualDB.getRecentTelemetry(50);
    const aggregation = dualDB.getPhonemeHesitationMatrix();

    return NextResponse.json({
      events,
      aggregation,
      count: events.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
