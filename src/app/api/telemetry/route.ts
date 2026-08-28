import { NextResponse } from 'next/server';
import { dualDB } from '@/lib/db/store';
import { pool } from '@/lib/db/postgres';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userName = 'Player 1',
      levelName = 'Castle of the Golden Knight',
      speedMultiplier = 1.0,
      targetWord,
      wordPattern,
      phonicsCategory,
      isCorrect = false,
      pauseDurationSeconds = 0,
      cluesTriggered = 0,
      streakCountAtAttempt = 0,
      scoreEarned = 0,
      studentId = 'stu_player_1',
      studentName,
      word,
      phonicsPattern,
      categoryLabel,
      latencyMs,
      hesitationMs,
      accuracyScore,
      scaffoldTriggered = false,
      timeGapToPhonemeMs = 45
    } = body;

    const actualTargetWord = targetWord || word;
    const actualPattern = wordPattern || phonicsPattern;
    const actualUserName = userName || studentName || 'Player 1';

    if (!actualTargetWord || !actualPattern) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Maintain in-memory telemetry store
    const recorded = dualDB.insertTelemetry({
      studentId,
      studentName: actualUserName,
      word: actualTargetWord,
      phonicsPattern: actualPattern,
      categoryLabel: categoryLabel || phonicsCategory || actualPattern,
      latencyMs: Number(latencyMs) || Math.round(Number(pauseDurationSeconds) * 1000),
      hesitationMs: Number(hesitationMs) || Math.max(0, Math.round(Number(pauseDurationSeconds) * 1000) - 80),
      accuracyScore: accuracyScore !== undefined ? Number(accuracyScore) : (isCorrect ? 1.0 : 0.0),
      scaffoldTriggered: Boolean(scaffoldTriggered || cluesTriggered > 0),
      timeGapToPhonemeMs: Number(timeGapToPhonemeMs) || 45
    });

    // 2. Insert transaction into Postgres word_game_attempts table
    let dbRecord = null;
    try {
      const validSessionId =
        sessionId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)
          ? sessionId
          : null;

      const query = `
        INSERT INTO public.word_game_attempts (
          session_id,
          user_name,
          level_name,
          speed_multiplier,
          target_word,
          word_pattern,
          phonics_category,
          is_correct,
          pause_duration_seconds,
          clues_triggered,
          streak_count_at_attempt,
          score_earned,
          attempted_at
        ) VALUES (
          COALESCE($1, gen_random_uuid()),
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          NOW()
        ) RETURNING attempt_id, session_id, attempted_at;
      `;

      const values = [
        validSessionId,
        actualUserName,
        levelName,
        Number(speedMultiplier) || 1.0,
        actualTargetWord,
        actualPattern,
        phonicsCategory || categoryLabel || null,
        Boolean(isCorrect),
        Number(pauseDurationSeconds) || 0,
        Number(cluesTriggered) || 0,
        Number(streakCountAtAttempt) || 0,
        Number(scoreEarned) || 0
      ];

      const result = await pool.query(query, values);
      dbRecord = result.rows[0];
    } catch (dbErr: any) {
      console.error('Failed to insert attempt to Postgres:', dbErr);
    }

    return NextResponse.json({ success: true, event: recorded, dbRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const events = dualDB.getRecentTelemetry(50);
    const aggregation = dualDB.getPhonemeHesitationMatrix();

    // Query latest attempts from postgres if available
    let dbAttempts: any[] = [];
    try {
      const result = await pool.query(`
        SELECT * FROM public.word_game_attempts ORDER BY attempted_at DESC LIMIT 50;
      `);
      dbAttempts = result.rows;
    } catch (dbErr) {
      console.error('Failed to fetch attempts from Postgres:', dbErr);
    }

    return NextResponse.json({
      events,
      aggregation,
      count: events.length,
      dbAttempts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

