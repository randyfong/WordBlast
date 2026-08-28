import { NextResponse } from 'next/server';
import { dualDB } from '@/lib/db/store';
import { pool } from '@/lib/db/postgres';

export async function GET() {
  try {
    let highScores: Array<{ id: string; name: string; score: number; streak: number; timestamp: string }> = [];

    // 1. Query ClickHouse Cloud / Postgres public.word_game_attempts table
    try {
      const result = await pool.query(`
        SELECT 
          user_name as name, 
          COALESCE(SUM(score_earned), 0)::int as score, 
          COALESCE(MAX(streak_count_at_attempt), 0)::int as streak,
          MAX(attempted_at) as timestamp
        FROM public.word_game_attempts
        GROUP BY user_name
        ORDER BY score DESC
        LIMIT 10;
      `);

      if (result.rows && result.rows.length > 0) {
        highScores = result.rows.map((row: any, idx: number) => ({
          id: `db_hs_${idx}_${row.name.replace(/\s+/g, '_')}`,
          name: row.name,
          score: Number(row.score),
          streak: Number(row.streak),
          timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString()
        }));
      }
    } catch (dbErr) {
      console.error('Failed to fetch leaderboard from public.word_game_attempts:', dbErr);
    }

    // 2. Fall back to in-memory store if database table returns no rows or fails
    if (highScores.length === 0) {
      highScores = dualDB.getHighScores();
    }

    return NextResponse.json({ highScores, source: highScores.length > 0 ? 'public.word_game_attempts' : 'in_memory' });
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

