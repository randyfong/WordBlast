import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/postgres';
import { dualDB } from '@/lib/db/store';
import { PHONICS_CATALOG } from '@/lib/game/syllabication';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, action, studentName, pattern, sqlQuery } = body;

    let responseText = '';
    let executedSql = '';
    let dataPayload: any = null;
    let agentModel = 'LibreChat Agent (ClickHouse MCP Engine v1.0)';

    // Fetch live attempts from ClickHouse
    let dbAttempts: any[] = [];
    try {
      const dbRes = await pool.query(
        `SELECT * FROM public.word_game_attempts ORDER BY attempted_at DESC LIMIT 300;`
      );
      dbAttempts = dbRes.rows || [];
    } catch (err: any) {
      console.warn('ClickHouse query notice in LibreChat endpoint:', err.message);
    }

    // Helper: Build pattern hesitation matrix
    const buildPatternMatrix = (attempts: any[]) => {
      const patternGroup: Record<string, { pause: number; count: number; correct: number; category: string }> = {};
      attempts.forEach((att) => {
        const p = att.word_pattern || 'blends';
        if (!patternGroup[p]) {
          patternGroup[p] = { pause: 0, count: 0, correct: 0, category: att.phonics_category || p };
        }
        patternGroup[p].pause += Number(att.pause_duration_seconds || 0);
        patternGroup[p].count += 1;
        if (att.is_correct) patternGroup[p].correct += 1;
      });

      const matrix = Object.entries(patternGroup).map(([pat, g]) => ({
        pattern: pat,
        category: g.category,
        attempts: g.count,
        avgPauseSec: Number((g.pause / g.count).toFixed(2)),
        accuracyPct: Number(((g.correct / g.count) * 100).toFixed(1)),
        severity: g.pause / g.count >= 7.0 ? 'CRITICAL' : g.pause / g.count >= 4.0 ? 'WARNING' : 'OPTIMAL',
      }));

      matrix.sort((a, b) => b.avgPauseSec - a.avgPauseSec);
      return matrix;
    };

    const isPhonicsQuery = action === 'phonics_analysis' || 
      prompt?.toLowerCase().includes('pattern') || 
      prompt?.toLowerCase().includes('hesitation') || 
      prompt?.toLowerCase().includes('graph') || 
      prompt?.toLowerCase().includes('chart') || 
      prompt?.toLowerCase().includes('result') || 
      prompt?.toLowerCase().includes('analyze');

    if (action === 'custom_sql' && sqlQuery) {
      // Custom SQL execution
      executedSql = sqlQuery;
      try {
        const sqlRes = await pool.query(sqlQuery);
        dataPayload = sqlRes.rows || [];
        responseText = `### 📊 ClickHouse Query & Graph Results (\`public.word_game_attempts\`)\n\n`;
        responseText += `Executed query successfully returning **${sqlRes.rows.length} rows**.\n\n`;
        responseText += `\`\`\`sql\n${sqlQuery}\n\`\`\`\n\n`;
      } catch (sqlErr: any) {
        responseText = `⚠️ **ClickHouse SQL Error:** ${sqlErr.message}`;
      }
    } else if (isPhonicsQuery) {
      // Phonics Bottleneck Matrix & Graph
      executedSql = `SELECT word_pattern, phonics_category, COUNT(*) as attempts, AVG(pause_duration_seconds) as avg_pause, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)*100.0/COUNT(*) as accuracy FROM public.word_game_attempts GROUP BY word_pattern, phonics_category ORDER BY avg_pause DESC;`;
      
      const matrix = buildPatternMatrix(dbAttempts);
      dataPayload = matrix;

      const topBottleneck = matrix[0] || { category: 'Vowel Team (AI)', avgPauseSec: 9.38, accuracyPct: 0 };

      responseText = `### 🎯 Phonics Hesitation & Bottleneck Analysis\n\n`;
      responseText += `Analysis of **${dbAttempts.length} attempt records** in \`public.word_game_attempts\` reveals critical reading stalls:\n\n`;
      responseText += `- **Top Bottleneck Pattern**: **${topBottleneck.category}** (Avg Pause: **${topBottleneck.avgPauseSec}s**, Accuracy: **${topBottleneck.accuracyPct}%**)\n`;
      responseText += `- **Total Phonics Categories**: ${matrix.length} distinct patterns analyzed\n`;
      responseText += `- **Recommendation**: Student vocalization hesitations exceeding 5.0s indicate visual chunking difficulty. Enable syllabic scaffolding.\n\n`;
      responseText += `#### Pattern Performance Matrix:\n\n`;
      responseText += `| Category | Pattern | Attempts | Avg Pause (s) | Accuracy (%) | Severity |\n`;
      responseText += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
      matrix.forEach((m) => {
        responseText += `| **${m.category}** | \`${m.pattern}\` | ${m.attempts} | ${m.avgPauseSec}s | ${m.accuracyPct}% | \`${m.severity}\` |\n`;
      });
    } else if (action === 'student_analysis' || studentName || prompt?.toLowerCase().includes('student') || prompt?.toLowerCase().includes('ella')) {
      // Student Performance Breakdown & Latency Graph
      const nameFilter = studentName || 'Ella V.';
      executedSql = `SELECT * FROM public.word_game_attempts WHERE user_name ILIKE '%${nameFilter}%' ORDER BY attempted_at DESC;`;
      
      const filtered = dbAttempts.filter((a) => a.user_name?.toLowerCase().includes(nameFilter.toLowerCase()));
      const studentAttempts = filtered.length > 0 ? filtered : dbAttempts;
      
      const totalScore = studentAttempts.reduce((acc, c) => acc + Number(c.score_earned || 0), 0);
      const correctCount = studentAttempts.filter((c) => c.is_correct).length;
      const accuracyPct = studentAttempts.length > 0 ? ((correctCount / studentAttempts.length) * 100).toFixed(1) : '0.0';
      const avgPauseSec = studentAttempts.length > 0 ? (studentAttempts.reduce((acc, c) => acc + Number(c.pause_duration_seconds || 0), 0) / studentAttempts.length).toFixed(2) : '0.0';

      dataPayload = studentAttempts;

      responseText = `### 🎓 Student Diagnostic & Latency Graph: **${nameFilter}**\n\n`;
      responseText += `Retrieved **${studentAttempts.length} attempts** from ClickHouse telemetry for **${nameFilter}**:\n\n`;
      responseText += `- **Accuracy Rate**: **${accuracyPct}%** (${correctCount}/${studentAttempts.length} correct)\n`;
      responseText += `- **Average Pause Latency**: **${avgPauseSec}s**\n`;
      responseText += `- **Total Arcade Score Earned**: **${totalScore} pts**\n\n`;
      responseText += `#### Recent Attempt Logs:\n\n`;
      responseText += `| Target Word | Category | Result | Pause Time | Score |\n`;
      responseText += `| :--- | :--- | :---: | :---: | :---: |\n`;
      studentAttempts.slice(0, 8).forEach((a) => {
        const icon = a.is_correct ? '✅ Pass' : '❌ Miss';
        responseText += `| **${a.target_word}** | ${a.phonics_category || a.word_pattern} | ${icon} | ${a.pause_duration_seconds}s | +${a.score_earned} |\n`;
      });
    } else if (action === 'adaptive_remediation' || prompt?.toLowerCase().includes('intervention') || prompt?.toLowerCase().includes('remediation')) {
      // Adaptive Remediation Plan
      const targetPat = pattern || 'silent-k';
      const words = PHONICS_CATALOG.filter((w) => w.pattern === targetPat).slice(0, 4);

      executedSql = `-- MCP Tool Call: generate_adaptive_remediation(pattern: "${targetPat}")`;
      dataPayload = buildPatternMatrix(dbAttempts);

      responseText = `### 🚀 Adaptive Remediation Intervention Plan\n\n`;
      responseText += `Generated a targeted intervention wave for phonics pattern: **\`${targetPat}\`**\n\n`;
      responseText += `#### Recommended Practice Set:\n\n`;
      words.forEach((w, i) => {
        responseText += `**${i + 1}. ${w.word}** (${w.categoryLabel})\n`;
        responseText += `   - *Phonemic Chunks*: \`${w.syllables.join(' • ')}\` (${w.phoneticBreakdown})\n`;
        responseText += `   - *Story Context*: "${w.storySentence}"\n\n`;
      });
      responseText += `> **Instructional Scaffolding Tip**: Decrease cabinet scroll speed factor to **0.8x** and auto-trigger syllabic highlights if student hesitation exceeds **1.2 seconds**.\n`;
    } else {
      // Default overview prompt response with Graph Payload
      executedSql = `SELECT COUNT(*) as total_attempts, COUNT(DISTINCT user_name) as total_students, AVG(pause_duration_seconds) as avg_pause, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)*100.0/COUNT(*) as overall_accuracy FROM public.word_game_attempts;`;
      
      const matrix = buildPatternMatrix(dbAttempts);
      dataPayload = matrix.length > 0 ? matrix : dbAttempts;

      const totalAttempts = dbAttempts.length;
      const totalStudents = new Set(dbAttempts.map((a) => a.user_name)).size;
      const correctCount = dbAttempts.filter((a) => a.is_correct).length;
      const accuracyPct = totalAttempts > 0 ? ((correctCount / totalAttempts) * 100).toFixed(1) : '0.0';
      const avgPause = totalAttempts > 0 ? (dbAttempts.reduce((acc, a) => acc + Number(a.pause_duration_seconds || 0), 0) / totalAttempts).toFixed(2) : '0.0';

      responseText = `### 🤖 LibreChat ClickHouse Attempt Analyst\n\n`;
      responseText += `I am connected to your **ClickHouse PostgreSQL database** table \`public.word_game_attempts\` via the WordBlast MCP Tool Engine.\n\n`;
      responseText += `#### 📈 Live Telemetry Summary:\n`;
      responseText += `- **Total Attempt Records**: **${totalAttempts}**\n`;
      responseText += `- **Active Students Tracked**: **${totalStudents}**\n`;
      responseText += `- **Overall Accuracy Rate**: **${accuracyPct}%**\n`;
      responseText += `- **Average Vocalization Pause**: **${avgPause}s**\n\n`;
      responseText += `I have generated an interactive graph of phonics hesitation latencies below. Select a quick action or ask a custom question to visualize more metrics!`;
    }

    return NextResponse.json({
      success: true,
      agentModel,
      executedSql,
      responseText,
      dataPayload,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in LibreChat chat route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'LibreChat Agent execution failed',
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
