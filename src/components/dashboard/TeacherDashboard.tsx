'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Clock, 
  Target, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Layers,
  Award,
  BookOpen,
  UserCheck
} from 'lucide-react';

interface MatrixRow {
  pattern: string;
  categoryLabel: string;
  sampleSize: number;
  avgLatencyMs: number;
  avgHesitationMs: number;
  accuracyRatePercent: number;
  scaffoldTriggerCount: number;
  severity: 'critical' | 'warning' | 'optimal';
  statusColor: string;
}

interface TelemetryEvent {
  id: string;
  studentId: string;
  studentName: string;
  word: string;
  phonicsPattern: string;
  categoryLabel: string;
  latencyMs: number;
  hesitationMs: number;
  accuracyScore: number;
  scaffoldTriggered: boolean;
  timestamp: string;
}

interface HighScore {
  id: string;
  name: string;
  score: number;
  streak: number;
  timestamp: string;
}

export const TeacherDashboard: React.FC = () => {
  const [matrixData, setMatrixData] = useState<MatrixRow[]>([]);
  const [recentEvents, setRecentEvents] = useState<TelemetryEvent[]>([]);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [directorStatus, setDirectorStatus] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('Maya Lin (4th Grade)');

  const fetchTelemetryData = async () => {
    try {
      const [telRes, scoreRes] = await Promise.all([
        fetch('/api/telemetry'),
        fetch('/api/leaderboard')
      ]);

      if (telRes.ok) {
        const telJson = await telRes.json();
        setMatrixData(telJson.aggregation || []);
        setRecentEvents(telJson.events || []);
      }

      if (scoreRes.ok) {
        const scoreJson = await scoreRes.json();
        setHighScores(scoreJson.highScores || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerAdaptiveGeneration = async (pattern?: string) => {
    setDirectorStatus('Creating custom practice round...');
    try {
      const res = await fetch('/api/adaptive-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern })
      });
      const data = await res.json();
      if (data.remediationPlan) {
        setDirectorStatus(
          `Custom practice round ready for ${data.remediationPlan.categoryLabel}! Target words loaded into student game.`
        );
      }
    } catch (e: any) {
      setDirectorStatus(`Could not create practice round: ${e.message}`);
    }
  };

  const criticalCategory = matrixData.find(m => m.severity === 'critical') || matrixData[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              LIVE CLASSROOM INSIGHTS
            </span>
            <span className="text-xs text-slate-400">4th-Grade Reading Progress</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Reading Fluency & Pause Tracker
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Shows exactly where students hesitate so you can provide helpful support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTelemetryData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>REFRESH DATA</span>
          </button>
        </div>
      </div>

      {/* Hero Remediation Insight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border-2 border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Recommended Focus Area</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
              Needs Practice (&gt;1.0s Pause)
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">
              Word Pattern Needing Attention:{' '}
              <span className="text-amber-400 font-bold underline decoration-amber-500">
                {criticalCategory ? criticalCategory.categoryLabel : 'Silent Letter Words (kn-, wr-, gn-)'}
              </span>
            </h3>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Instead of just showing an overall grade score, the tracker shows that <strong className="text-white">{selectedStudent}</strong> reads <span className="text-emerald-400 font-semibold">95% of standard letter blends</span> smoothly (0.4s pause), but hesitates for an average of <strong className="text-amber-400">{criticalCategory ? `${(criticalCategory.avgLatencyMs / 1000).toFixed(1)} seconds` : '1.8 seconds'}</strong> exclusively on silent-letter words.
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">RECOMMENDED ACTION</div>
                  <div className="text-sm font-semibold text-purple-300">
                    Send 10-second targeted word challenge to student
                  </div>
                </div>
              </div>

              <button
                onClick={() => triggerAdaptiveGeneration(criticalCategory?.pattern)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95"
              >
                SEND PRACTICE ROUND
              </button>
            </div>

            {directorStatus && (
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs animate-fadeIn">
                ✨ {directorStatus}
              </div>
            )}
          </div>
        </div>

        {/* Student Profile Quick Stats */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider">STUDENT PROFILE</div>
            <h4 className="text-lg font-bold text-white flex items-center justify-between">
              <span>{selectedStudent}</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Active
              </span>
            </h4>
            <div className="text-xs text-slate-400 mt-1">4th Grade • Room 204</div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">AVG READ TIME</div>
              <div className="text-xl font-bold text-cyan-400">0.6 sec</div>
              <div className="text-[10px] text-emerald-400 font-medium">+18% faster this week</div>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">WORDS READ</div>
              <div className="text-xl font-bold text-amber-400">248</div>
              <div className="text-[10px] text-slate-400">Across 3 games</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
            💡 <strong className="text-cyan-300">Reading Tip:</strong> Speaking words out loud helps connect visual spelling with spoken sounds for lasting word memory.
          </div>
        </div>
      </div>

      {/* Word Hesitation Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">
                Word Pattern Pause Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Average pause time before speaking each type of word. Pauses over 1.0 second highlight patterns that need practice.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            GOAL: Under 1.0s pause
          </span>
        </div>

        {/* Visual Telemetry Bars */}
        <div className="space-y-4">
          {matrixData.map((item) => {
            const maxVal = 2000;
            const barWidthPercent = Math.min(100, Math.round((item.avgLatencyMs / maxVal) * 100));
            const pauseInSeconds = (item.avgLatencyMs / 1000).toFixed(2);

            return (
              <div key={item.pattern} className="space-y-1.5 p-3 rounded-2xl bg-black/30 border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm w-44 truncate">
                      {item.categoryLabel}
                    </span>
                    <span className="text-slate-400">
                      Accuracy: <strong className={item.accuracyRatePercent >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{item.accuracyRatePercent}%</strong>
                    </span>
                    <span className="text-slate-500 hidden md:inline">
                      ({item.sampleSize} words tried)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.scaffoldTriggerCount > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                        Clues used {item.scaffoldTriggerCount}x
                      </span>
                    )}
                    <span className="text-sm font-bold" style={{ color: item.statusColor }}>
                      {pauseInSeconds} sec pause
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-5 bg-slate-950 rounded-lg p-0.5 border border-slate-800 relative overflow-hidden flex items-center">
                  {/* 1.0s threshold line marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 opacity-70"
                    style={{ left: '50%' }}
                    title="1.0s Target Threshold"
                  />
                  
                  <div
                    className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${barWidthPercent}%`,
                      backgroundColor: item.statusColor,
                      boxShadow: `0 0 10px ${item.statusColor}66`
                    }}
                  >
                    {barWidthPercent > 15 && (
                      <span className="text-[10px] font-bold text-black drop-shadow">
                        {pauseInSeconds}s
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Column: Live Activity Stream & Top Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Stream */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-base">
                Live Student Activity Stream
              </h4>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 animate-pulse">
              ● LIVE UPDATES
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recentEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2.5 rounded-xl bg-black/40 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white text-sm">{ev.word}</span>
                  <span className="text-slate-400">[{ev.categoryLabel}]</span>
                  {ev.scaffoldTriggered && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px]">
                      Clue Shown
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    Response time: <strong className="text-slate-200">{(ev.latencyMs / 1000).toFixed(2)}s</strong>
                  </span>
                  <span className={`font-bold ${ev.latencyMs >= 1000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {ev.accuracyScore > 0 ? 'Correct' : 'Missed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student High Scores */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-base">Classroom Leaderboard</h4>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Top Scores</span>
          </div>

          <div className="space-y-2">
            {highScores.map((hs, idx) => (
              <div
                key={hs.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  idx === 0 
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                    : 'bg-black/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm w-5">{idx + 1}.</span>
                  <span className="font-bold text-white">{hs.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{hs.streak}x streak</span>
                  <span className="font-extrabold text-amber-400">{hs.score.toLocaleString()} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
