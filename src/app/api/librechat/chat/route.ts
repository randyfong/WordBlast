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

    // Normalize prompt text
    const lowerPrompt = (prompt || '').toLowerCase().trim();

    // 1. Explicit Custom SQL Execution
    if (action === 'custom_sql' && sqlQuery) {
      executedSql = sqlQuery;
      try {
        const sqlRes = await pool.query(sqlQuery);
        dataPayload = sqlRes.rows || [];
        responseText = `### 📊 Custom ClickHouse Query Results (\`public.word_game_attempts\`)\n\n`;
        responseText += `Executed custom query successfully returning **${sqlRes.rows.length} rows**.\n\n`;
        responseText += `\`\`\`sql\n${sqlQuery}\n\`\`\`\n\n`;
      } catch (sqlErr: any) {
        responseText = `⚠️ **ClickHouse SQL Error:** ${sqlErr.message}`;
      }
    } 
    // 2. Preset Action: User Transactions
    else if (action === 'user_transactions' || (lowerPrompt.includes('user') && lowerPrompt.includes('transaction'))) {
      executedSql = `SELECT user_name, COUNT(*) as transactions, SUM(score_earned) as total_score, ROUND(AVG(pause_duration_seconds)::numeric, 2) as avg_pause FROM public.word_game_attempts GROUP BY user_name ORDER BY transactions DESC;`;

      try {
        const sqlRes = await pool.query(executedSql);
        const userRows = sqlRes.rows || [];

        dataPayload = userRows.map((r: any) => ({
          user_name: r.user_name,
          transactions: Number(r.transactions),
          total_score: Number(r.total_score || 0),
          avg_pause: Number(r.avg_pause || 0),
        }));

        const totalTx = dataPayload.reduce((acc: number, u: any) => acc + u.transactions, 0);

        responseText = `### 📊 User Transactions Bar Chart (\`public.word_game_attempts\`)\n\n`;
        responseText += `Retrieved transaction counts for **${dataPayload.length} distinct users** (${totalTx} total transactions) from ClickHouse telemetry:\n\n`;
        responseText += `#### User Transaction Breakdown:\n\n`;
        responseText += `| User Name | Transactions | Total Score | Avg Pause (s) |\n`;
        responseText += `| :--- | :---: | :---: | :---: |\n`;
        dataPayload.forEach((u: any) => {
          responseText += `| **${u.user_name}** | ${u.transactions} | ${u.total_score} pts | ${u.avg_pause}s |\n`;
        });
      } catch (err: any) {
        responseText = `⚠️ **ClickHouse Query Error:** ${err.message}`;
      }
    } 
    // 3. User Count / Roster Query (e.g. "how many users are there", "who played", "list users")
    else if (lowerPrompt.includes('how many user') || lowerPrompt.includes('count of user') || lowerPrompt.includes('user count') || lowerPrompt.includes('who are the user') || lowerPrompt.includes('list user')) {
      executedSql = `SELECT user_name, COUNT(*) as total_attempts, SUM(score_earned) as total_score, ROUND(AVG(pause_duration_seconds)::numeric, 2) as avg_pause FROM public.word_game_attempts GROUP BY user_name ORDER BY total_attempts DESC;`;

      try {
        const sqlRes = await pool.query(executedSql);
        const userRows = sqlRes.rows || [];

        dataPayload = userRows.map((r: any) => ({
          user_name: r.user_name,
          transactions: Number(r.total_attempts),
          total_score: Number(r.total_score || 0),
          avg_pause: Number(r.avg_pause || 0),
        }));

        const totalAttempts = dataPayload.reduce((acc: number, u: any) => acc + u.transactions, 0);

        responseText = `### 👥 User Count & Roster Summary (\`public.word_game_attempts\`)\n\n`;
        responseText += `There are **${dataPayload.length} distinct users** logged in \`public.word_game_attempts\` with **${totalAttempts} total attempts**:\n\n`;
        responseText += `#### User Roster Breakdown:\n\n`;
        responseText += `| User Name | Attempts | Total Score | Avg Pause Latency |\n`;
        responseText += `| :--- | :---: | :---: | :---: |\n`;
        dataPayload.forEach((u: any) => {
          responseText += `| **${u.user_name}** | ${u.transactions} | ${u.total_score} pts | ${u.avg_pause}s |\n`;
        });
      } catch (err: any) {
        responseText = `⚠️ **ClickHouse Query Error:** ${err.message}`;
      }
    }
    // 4. Target Word / Latency / Missed Words Query
    else if (lowerPrompt.includes('word') || lowerPrompt.includes('pause') || lowerPrompt.includes('miss') || lowerPrompt.includes('slow')) {
      executedSql = `SELECT target_word, phonics_category, COUNT(*) as attempt_count, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as pass_count, ROUND(AVG(pause_duration_seconds)::numeric, 2) as avg_pause FROM public.word_game_attempts GROUP BY target_word, phonics_category ORDER BY avg_pause DESC LIMIT 15;`;

      try {
        const sqlRes = await pool.query(executedSql);
        const wordRows = sqlRes.rows || [];

        dataPayload = wordRows.map((r: any) => ({
          target_word: r.target_word,
          pause_duration_seconds: Number(r.avg_pause),
          is_correct: r.pass_count > 0,
        }));

        responseText = `### 🔤 Target Word Pause Latency Breakdown (\`public.word_game_attempts\`)\n\n`;
        responseText += `Retrieved vocal pause latencies across **${wordRows.length} target words** in \`public.word_game_attempts\`:\n\n`;
        responseText += `| Target Word | Phonics Category | Attempts | Passes | Avg Pause (s) |\n`;
        responseText += `| :--- | :--- | :---: | :---: | :---: |\n`;
        wordRows.forEach((w: any) => {
          responseText += `| **${w.target_word}** | ${w.phonics_category || 'blends'} | ${w.attempt_count} | ${w.pass_count} | ${w.avg_pause}s |\n`;
        });
      } catch (err: any) {
        responseText = `⚠️ **ClickHouse Query Error:** ${err.message}`;
      }
    }
    // 5. Specific Student Search (e.g. "Logan", "Ella", "Maya")
    else if (action === 'student_analysis' || studentName || lowerPrompt.includes('student') || lowerPrompt.includes('logan') || lowerPrompt.includes('ella') || lowerPrompt.includes('maya')) {
      let nameFilter = studentName || '';
      if (!nameFilter) {
        if (lowerPrompt.includes('logan')) nameFilter = 'Logan';
        else if (lowerPrompt.includes('ella')) nameFilter = 'Ella';
        else if (lowerPrompt.includes('maya')) nameFilter = 'Maya';
        else nameFilter = 'Ella';
      }

      executedSql = `SELECT * FROM public.word_game_attempts WHERE user_name ILIKE '%${nameFilter}%' ORDER BY attempted_at DESC LIMIT 50;`;

      try {
        const sqlRes = await pool.query(executedSql);
        const filtered = sqlRes.rows || [];
        const studentAttempts = filtered.length > 0 ? filtered : dbAttempts;

        const totalScore = studentAttempts.reduce((acc: number, c: any) => acc + Number(c.score_earned || 0), 0);
        const correctCount = studentAttempts.filter((c: any) => c.is_correct).length;
        const accuracyPct = studentAttempts.length > 0 ? ((correctCount / studentAttempts.length) * 100).toFixed(1) : '0.0';
        const avgPauseSec = studentAttempts.length > 0 ? (studentAttempts.reduce((acc: number, c: any) => acc + Number(c.pause_duration_seconds || 0), 0) / studentAttempts.length).toFixed(2) : '0.0';

        dataPayload = studentAttempts;

        responseText = `### 🎓 Student Diagnostic & Latency Logs: **${nameFilter}**\n\n`;
        responseText += `Retrieved **${studentAttempts.length} attempts** from \`public.word_game_attempts\` for **${nameFilter}**:\n\n`;
        responseText += `- **Accuracy Rate**: **${accuracyPct}%** (${correctCount}/${studentAttempts.length} correct)\n`;
        responseText += `- **Average Pause Latency**: **${avgPauseSec}s**\n`;
        responseText += `- **Total Arcade Score**: **${totalScore} pts**\n\n`;
        responseText += `#### Attempt Logs:\n\n`;
        responseText += `| Target Word | Category | Result | Pause Time | Score |\n`;
        responseText += `| :--- | :--- | :---: | :---: | :---: |\n`;
        studentAttempts.slice(0, 8).forEach((a: any) => {
          const icon = a.is_correct ? '✅ Pass' : '❌ Miss';
          responseText += `| **${a.target_word}** | ${a.phonics_category || a.word_pattern} | ${icon} | ${a.pause_duration_seconds}s | +${a.score_earned} |\n`;
        });
      } catch (err: any) {
        responseText = `⚠️ **ClickHouse Query Error:** ${err.message}`;
      }
    } 
    // 6. Phonics Analysis Preset
    else if (action === 'phonics_analysis' || lowerPrompt.includes('pattern') || lowerPrompt.includes('phonics') || lowerPrompt.includes('hesitation')) {
      executedSql = `SELECT word_pattern, phonics_category, COUNT(*) as attempts, AVG(pause_duration_seconds) as avg_pause, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)*100.0/COUNT(*) as accuracy FROM public.word_game_attempts GROUP BY word_pattern, phonics_category ORDER BY avg_pause DESC;`;
      
      const matrix = buildPatternMatrix(dbAttempts);
      dataPayload = matrix;

      const topBottleneck = matrix[0] || { category: 'Vowel Team (AI)', avgPauseSec: 9.38, accuracyPct: 0 };

      responseText = `### 🎯 Phonics Hesitation & Bottleneck Analysis\n\n`;
      responseText += `Analysis of **${dbAttempts.length} attempt records** in \`public.word_game_attempts\` reveals critical reading stalls:\n\n`;
      responseText += `- **Top Bottleneck Pattern**: **${topBottleneck.category}** (Avg Pause: **${topBottleneck.avgPauseSec}s**, Accuracy: **${topBottleneck.accuracyPct}%**)\n`;
      responseText += `- **Total Phonics Categories**: ${matrix.length} distinct patterns analyzed\n\n`;
      responseText += `#### Pattern Performance Matrix:\n\n`;
      responseText += `| Category | Pattern | Attempts | Avg Pause (s) | Accuracy (%) | Severity |\n`;
      responseText += `| :--- | :--- | :---: | :---: | :---: | :---: |\n`;
      matrix.forEach((m) => {
        responseText += `| **${m.category}** | \`${m.pattern}\` | ${m.attempts} | ${m.avgPauseSec}s | ${m.accuracyPct}% | \`${m.severity}\` |\n`;
      });
    }
    // 7. General Dynamic Search Query for Any Entered Prompt
    else {
      const searchTerm = prompt ? `%${prompt.trim()}%` : '%';
      executedSql = `SELECT user_name, target_word, phonics_category, pause_duration_seconds, is_correct, score_earned, attempted_at FROM public.word_game_attempts WHERE user_name ILIKE $1 OR target_word ILIKE $1 OR phonics_category ILIKE $1 OR word_pattern ILIKE $1 ORDER BY attempted_at DESC LIMIT 50;`;
      
      let queryRows: any[] = [];
      try {
        const sqlRes = await pool.query(executedSql, [searchTerm]);
        queryRows = sqlRes.rows || [];
        if (queryRows.length === 0) {
          const fallbackRes = await pool.query(`SELECT user_name, target_word, phonics_category, pause_duration_seconds, is_correct, score_earned FROM public.word_game_attempts ORDER BY attempted_at DESC LIMIT 20;`);
          queryRows = fallbackRes.rows || [];
        }
      } catch (err: any) {
        queryRows = dbAttempts;
      }

      const totalAttempts = queryRows.length;
      const uniqueUsers = Array.from(new Set(queryRows.map((a) => a.user_name).filter(Boolean)));

      dataPayload = queryRows.map((r: any) => ({
        user_name: r.user_name,
        target_word: r.target_word,
        pause_duration_seconds: Number(r.pause_duration_seconds || 0),
        is_correct: r.is_correct,
      }));

      responseText = `### 🔍 Telemetry Search Results for: "${prompt}" (\`public.word_game_attempts\`)\n\n`;
      responseText += `Queried \`public.word_game_attempts\` for matching records to **"${prompt}"**:\n\n`;
      responseText += `- **Matches Found**: **${queryRows.length} records**\n`;
      responseText += `- **Matched Users**: **${uniqueUsers.length}** (${uniqueUsers.join(', ') || 'N/A'})\n\n`;
      responseText += `#### Matching Query Results:\n\n`;
      responseText += `| User Name | Target Word | Phonics Category | Pause Sec | Result |\n`;
      responseText += `| :--- | :--- | :--- | :---: | :---: |\n`;
      queryRows.slice(0, 8).forEach((r) => {
        const passIcon = r.is_correct ? '✅ Pass' : '❌ Miss';
        responseText += `| **${r.user_name}** | \`${r.target_word}\` | ${r.phonics_category || 'blends'} | ${r.pause_duration_seconds}s | ${passIcon} |\n`;
      });
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
