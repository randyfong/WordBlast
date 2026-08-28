import { NextResponse } from 'next/server';
import { dualDB } from '@/lib/db/store';
import { PHONICS_CATALOG, PhonicsWord } from '@/lib/game/syllabication';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetPattern = body.pattern;

    // Get aggregated ClickHouse latency matrix to find struggling bottlenecks (>1000ms latency)
    const metrics = dualDB.getPhonemeHesitationMatrix();
    const criticalBottleneck = targetPattern 
      ? metrics.find(m => m.pattern === targetPattern) 
      : metrics.find(m => m.severity === 'critical') || metrics[0];

    const selectedPattern = criticalBottleneck ? criticalBottleneck.pattern : 'silent-k';

    // Filter phonics catalog for target remediation wave
    let waveWords: PhonicsWord[] = PHONICS_CATALOG.filter(w => w.pattern === selectedPattern);

    if (waveWords.length === 0) {
      waveWords = PHONICS_CATALOG.slice(0, 4);
    }

    // Procedural remediation package
    const remediationPlan = {
      targetPattern: selectedPattern,
      categoryLabel: criticalBottleneck ? criticalBottleneck.categoryLabel : 'Silent Letter Pattern',
      bottleneckReason: criticalBottleneck 
        ? `Avg Hesitation latency is ${criticalBottleneck.avgLatencyMs}ms (Threshold: >1,000ms). Dynamic chunking recommended.`
        : `Targeted remediation session based on telemetry.`,
      recommendedSpeedFactor: 0.85, // Slower drop speed to allow orthographic mapping
      waveWords,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      directorMode: 'ADAPTIVE_REMEDIATION',
      remediationPlan
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
