import { NextResponse } from 'next/server';
import { dualDB } from '@/lib/db/store';

export async function GET() {
  try {
    const scores = dualDB.getHighScores();
    return NextResponse.json({ highScores: scores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name = 'ARCADE_PILOT', score = 0, streak = 0 } = body;

    const entry = dualDB.recordHighScore(name, Number(score), Number(streak));
    return NextResponse.json({ success: true, entry, highScores: dualDB.getHighScores() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
