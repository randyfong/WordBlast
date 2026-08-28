export interface TelemetryEvent {
  id: string;
  studentId: string;
  studentName: string;
  word: string;
  phonicsPattern: 'silent-k' | 'silent-w' | 'silent-g' | 'digraph-ph' | 'digraph-ch' | 'digraph-sh' | 'vowel-team-ea' | 'vowel-team-oa' | 'vowel-team-ai' | 'blends';
  categoryLabel: string;
  latencyMs: number;
  hesitationMs: number;
  accuracyScore: number;
  scaffoldTriggered: boolean;
  timestamp: string;
  timeGapToPhonemeMs: number;
}

// In-Memory ClickHouse & PostgreSQL Store with initial seed data reflecting 4th-grade research findings
class ClickHouseDualStore {
  private telemetryTable: TelemetryEvent[] = [];
  private highScores: { id: string; name: string; score: number; streak: number; timestamp: string }[] = [];

  constructor() {
    this.seedInitialTelemetry();
  }

  private seedInitialTelemetry() {
    const student = { id: 'stu_4a_maya', name: 'Maya Lin (4th Grade)' };
    const now = Date.now();

    // Baseline blends (Fast & accurate: ~450ms, 95% accuracy)
    const blendWords = ['DRAGON', 'BLAST', 'STREAM', 'CRISP', 'PLUM'];
    blendWords.forEach((w, i) => {
      this.telemetryTable.push({
        id: `seed_blend_${i}`,
        studentId: student.id,
        studentName: student.name,
        word: w,
        phonicsPattern: 'blends',
        categoryLabel: 'Standard Blends',
        latencyMs: 420 + Math.floor(Math.random() * 80),
        hesitationMs: 380 + Math.floor(Math.random() * 60),
        accuracyScore: 0.95,
        scaffoldTriggered: false,
        timestamp: new Date(now - (30 - i) * 60000).toISOString(),
        timeGapToPhonemeMs: 35
      });
    });

    // Digraphs (Moderate: ~640ms, 88% accuracy)
    const digraphWords = ['PHANTOM', 'DOLPHIN', 'CHOP', 'SHIP'];
    digraphWords.forEach((w, i) => {
      this.telemetryTable.push({
        id: `seed_digraph_${i}`,
        studentId: student.id,
        studentName: student.name,
        word: w,
        phonicsPattern: 'digraph-ph',
        categoryLabel: 'Letter Combo (PH)',
        latencyMs: 610 + Math.floor(Math.random() * 70),
        hesitationMs: 560 + Math.floor(Math.random() * 60),
        accuracyScore: 0.88,
        scaffoldTriggered: false,
        timestamp: new Date(now - (20 - i) * 60000).toISOString(),
        timeGapToPhonemeMs: 50
      });
    });

    // Silent-W (High latency: ~980ms)
    const silentWWords = ['WRESTLE', 'WRIST', 'WRITTEN'];
    silentWWords.forEach((w, i) => {
      this.telemetryTable.push({
        id: `seed_silentw_${i}`,
        studentId: student.id,
        studentName: student.name,
        word: w,
        phonicsPattern: 'silent-w',
        categoryLabel: 'Silent W (WR-)',
        latencyMs: 950 + Math.floor(Math.random() * 90),
        hesitationMs: 890 + Math.floor(Math.random() * 70),
        accuracyScore: 0.72,
        scaffoldTriggered: false,
        timestamp: new Date(now - (15 - i) * 60000).toISOString(),
        timeGapToPhonemeMs: 95
      });
    });

    // Silent-K (CRITICAL BOTTLENECK: 1,420ms - 1,850ms, 60% accuracy, Scaffolding triggered)
    const silentKWords = ['KNIGHT', 'KNOT', 'KNUCKLE', 'KNIFE'];
    silentKWords.forEach((w, i) => {
      const lat = 1420 + Math.floor(Math.random() * 450);
      this.telemetryTable.push({
        id: `seed_silentk_${i}`,
        studentId: student.id,
        studentName: student.name,
        word: w,
        phonicsPattern: 'silent-k',
        categoryLabel: 'Silent K (KN-)',
        latencyMs: lat,
        hesitationMs: lat - 120,
        accuracyScore: 0.60,
        scaffoldTriggered: lat >= 1500,
        timestamp: new Date(now - (10 - i) * 60000).toISOString(),
        timeGapToPhonemeMs: 145
      });
    });

    // High scores
    this.highScores = [
      { id: 'hs_1', name: 'LEO R.', score: 14200, streak: 18, timestamp: new Date(now - 120000).toISOString() },
      { id: 'hs_2', name: 'MAYA L.', score: 11850, streak: 12, timestamp: new Date(now - 60000).toISOString() },
      { id: 'hs_3', name: 'SAMMY T.', score: 9400, streak: 8, timestamp: new Date(now - 300000).toISOString() },
      { id: 'hs_4', name: 'AVA K.', score: 8100, streak: 6, timestamp: new Date(now - 450000).toISOString() },
      { id: 'hs_5', name: 'NOAH C.', score: 6750, streak: 5, timestamp: new Date(now - 600000).toISOString() }
    ];
  }

  public insertTelemetry(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): TelemetryEvent {
    const record: TelemetryEvent = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.telemetryTable.unshift(record);
    // Keep reasonable buffer
    if (this.telemetryTable.length > 500) {
      this.telemetryTable.pop();
    }
    return record;
  }

  public getRecentTelemetry(limit = 50): TelemetryEvent[] {
    return this.telemetryTable.slice(0, limit);
  }

  // ClickHouse OLAP Aggregation Query Simulation
  public getPhonemeHesitationMatrix() {
    const patternMap: Record<string, {
      pattern: string;
      categoryLabel: string;
      totalCount: number;
      totalLatency: number;
      totalHesitation: number;
      correctCount: number;
      scaffoldCount: number;
      samples: TelemetryEvent[];
    }> = {};

    for (const ev of this.telemetryTable) {
      if (!patternMap[ev.phonicsPattern]) {
        patternMap[ev.phonicsPattern] = {
          pattern: ev.phonicsPattern,
          categoryLabel: ev.categoryLabel,
          totalCount: 0,
          totalLatency: 0,
          totalHesitation: 0,
          correctCount: 0,
          scaffoldCount: 0,
          samples: []
        };
      }
      const group = patternMap[ev.phonicsPattern];
      group.totalCount++;
      group.totalLatency += ev.latencyMs;
      group.totalHesitation += ev.hesitationMs;
      group.correctCount += (ev.accuracyScore >= 0.8 ? 1 : 0);
      if (ev.scaffoldTriggered) group.scaffoldCount++;
      if (group.samples.length < 5) group.samples.push(ev);
    }

    return Object.values(patternMap).map(g => {
      const avgLatency = Math.round(g.totalLatency / g.totalCount);
      const avgHesitation = Math.round(g.totalHesitation / g.totalCount);
      const accuracyRate = Math.round((g.correctCount / g.totalCount) * 100);
      const isCritical = avgLatency >= 1000;
      const isWarning = avgLatency >= 700 && avgLatency < 1000;

      return {
        pattern: g.pattern,
        categoryLabel: g.categoryLabel,
        sampleSize: g.totalCount,
        avgLatencyMs: avgLatency,
        avgHesitationMs: avgHesitation,
        accuracyRatePercent: accuracyRate,
        scaffoldTriggerCount: g.scaffoldCount,
        severity: isCritical ? 'critical' : isWarning ? 'warning' : 'optimal',
        statusColor: isCritical ? '#ff0055' : isWarning ? '#ffb700' : '#00f0ff'
      };
    }).sort((a, b) => b.avgLatencyMs - a.avgLatencyMs);
  }

  // Postgres OLTP Leaderboard Simulation
  public getHighScores() {
    return this.highScores;
  }

  public recordHighScore(name: string, score: number, streak: number) {
    const entry = {
      id: `hs_${Date.now()}`,
      name: name.toUpperCase().slice(0, 10),
      score,
      streak,
      timestamp: new Date().toISOString()
    };
    this.highScores.push(entry);
    this.highScores.sort((a, b) => b.score - a.score);
    this.highScores = this.highScores.slice(0, 10);
    return entry;
  }
}

// Global singleton
const globalStore = global as unknown as { clickHouseDualStore?: ClickHouseDualStore };
export const dualDB = globalStore.clickHouseDualStore || new ClickHouseDualStore();
if (process.env.NODE_ENV !== 'production') {
  globalStore.clickHouseDualStore = dualDB;
}
