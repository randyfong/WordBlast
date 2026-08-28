import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/postgres';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 500);
    const userName = searchParams.get('userName');
    const wordPattern = searchParams.get('wordPattern');
    const isCorrect = searchParams.get('isCorrect');
    const search = searchParams.get('search');

    // 1. Fetch raw attempts with dynamic filters
    let baseSql = `SELECT attempt_id, session_id, attempted_at, user_name, level_name, speed_multiplier, target_word, word_pattern, phonics_category, is_correct, pause_duration_seconds, clues_triggered, streak_count_at_attempt, score_earned FROM public.word_game_attempts`;
    const conditions: string[] = [];
    const params: any[] = [];

    if (userName) {
      params.push(`%${userName}%`);
      conditions.push(`user_name ILIKE $${params.length}`);
    }

    if (wordPattern) {
      params.push(wordPattern);
      conditions.push(`word_pattern = $${params.length}`);
    }

    if (isCorrect !== null && isCorrect !== undefined && isCorrect !== '') {
      params.push(isCorrect === 'true');
      conditions.push(`is_correct = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(target_word ILIKE $${params.length} OR user_name ILIKE $${params.length} OR phonics_category ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      baseSql += ` WHERE ` + conditions.join(' AND ');
    }

    baseSql += ` ORDER BY attempted_at DESC LIMIT $${params.length + 1};`;
    params.push(limit);

    const attemptsRes = await pool.query(baseSql, params);
    const rows = attemptsRes.rows || [];

    // 2. Compute overall table summary metrics
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*)::int as total_attempts,
        COUNT(DISTINCT user_name)::int as total_students,
        COALESCE(AVG(pause_duration_seconds), 0)::float as avg_pause_sec,
        COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0)::float as overall_accuracy_pct,
        COALESCE(SUM(score_earned), 0)::int as total_score_earned
      FROM public.word_game_attempts;
    `);
    const stats = statsRes.rows[0] || {
      total_attempts: 0,
      total_students: 0,
      avg_pause_sec: 0,
      overall_accuracy_pct: 0,
      total_score_earned: 0,
    };

    // 3. Compute phonics pattern breakdown matrix
    const patternRes = await pool.query(`
      SELECT 
        word_pattern,
        phonics_category,
        COUNT(*)::int as attempt_count,
        COALESCE(AVG(pause_duration_seconds), 0)::float as avg_pause_sec,
        COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0)::float as accuracy_pct,
        COALESCE(SUM(clues_triggered), 0)::int as total_clues_used
      FROM public.word_game_attempts
      GROUP BY word_pattern, phonics_category
      ORDER BY avg_pause_sec DESC;
    `);

    const patternBreakdown = (patternRes.rows || []).map((p: any) => {
      const isCritical = p.avg_pause_sec >= 7.0;
      const isWarning = p.avg_pause_sec >= 4.0 && p.avg_pause_sec < 7.0;
      return {
        patternKey: p.word_pattern,
        categoryLabel: p.phonics_category || p.word_pattern,
        attemptCount: p.attempt_count,
        avgPauseSec: Number(p.avg_pause_sec.toFixed(2)),
        accuracyPct: Number(p.accuracy_pct.toFixed(1)),
        cluesUsed: p.total_clues_used,
        severity: isCritical ? 'critical' : isWarning ? 'warning' : 'optimal',
      };
    });

    // 4. Compute student leaderboard summary
    const studentRes = await pool.query(`
      SELECT 
        user_name,
        COUNT(*)::int as total_attempts,
        COALESCE(AVG(pause_duration_seconds), 0)::float as avg_pause_sec,
        COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0)::float as accuracy_pct,
        MAX(streak_count_at_attempt)::int as max_streak,
        COALESCE(SUM(score_earned), 0)::int as total_score
      FROM public.word_game_attempts
      GROUP BY user_name
      ORDER BY total_score DESC, accuracy_pct DESC;
    `);

    const studentSummary = (studentRes.rows || []).map((s: any) => ({
      userName: s.user_name,
      totalAttempts: s.total_attempts,
      avgPauseSec: Number(s.avg_pause_sec.toFixed(2)),
      accuracyPct: Number(s.accuracy_pct.toFixed(1)),
      maxStreak: s.max_streak,
      totalScore: s.total_score,
    }));

    return NextResponse.json({
      success: true,
      tableName: 'public.word_game_attempts',
      database: 'ClickHouse (PostgreSQL Wire Protocol)',
      timestamp: new Date().toISOString(),
      summary: {
        totalAttempts: stats.total_attempts,
        totalStudents: stats.total_students,
        avgPauseSec: Number(stats.avg_pause_sec.toFixed(2)),
        overallAccuracyPct: Number(stats.overall_accuracy_pct.toFixed(1)),
        totalScoreEarned: stats.total_score_earned,
      },
      patternBreakdown,
      studentSummary,
      attempts: rows,
    });
  } catch (error: any) {
    console.error('Error fetching ClickHouse attempts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ClickHouse query failed',
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
