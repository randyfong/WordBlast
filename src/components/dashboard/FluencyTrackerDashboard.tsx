'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Lightbulb,
  Send,
  Zap,
  CheckCircle2,
  Clock,
  ChevronDown,
  User
} from 'lucide-react';

interface PatternBreakdown {
  patternKey: string;
  categoryLabel: string;
  accuracyPercent: number;
  wordsTriedCount: number;
  cluesUsedCount: number;
  pauseDurationSec: number;
  severity: 'critical' | 'warning' | 'optimal';
  barColor: string;
}

interface FluencyData {
  timestamp: string;
  agentSource?: string;
  studentProfile: {
    id: string;
    name: string;
    grade: string;
    room: string;
    status: string;
    avgReadTimeSec: number;
    avgReadTimeTrend: string;
    wordsReadCount: number;
  };
  recommendedFocus: {
    categoryLabel: string;
    patternKey: string;
    pauseLabel: string;
    actionTitle: string;
    actionButtonText: string;
    aiNarrative: string;
  };
  readingTip: string;
  patternBreakdowns: PatternBreakdown[];
}

const STUDENT_OPTIONS = [
  { id: 'stu_4a_maya', name: 'Maya Lin (4th Grade)' },
  { id: 'stu_4a_leo', name: 'Leo R. (4th Grade)' },
  { id: 'stu_4a_ella', name: 'Ella V. (4th Grade)' },
  { id: 'stu_4a_logan', name: 'Logan R. (4th Grade)' },
  { id: 'stu_4a_sammy', name: 'Sammy T. (4th Grade)' },
  { id: 'stu_4a_ava', name: 'Ava K. (4th Grade)' },
  { id: 'stu_4a_noah', name: 'Noah C. (4th Grade)' },
];

export const FluencyTrackerDashboard: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState('stu_4a_maya');
  const [data, setData] = useState<FluencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const fetchFluencyData = async (studentId = selectedStudentId) => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/fluency-insights?studentId=${studentId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch fluency insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFluencyData(selectedStudentId);
    const interval = setInterval(() => fetchFluencyData(selectedStudentId), 5000);
    return () => clearInterval(interval);
  }, [selectedStudentId]);

  const handleStudentChange = (newStudentId: string) => {
    setSelectedStudentId(newStudentId);
    setLoading(true);
    fetchFluencyData(newStudentId);
  };

  const handleSendPracticeRound = async (pattern?: string) => {
    setActionStatus('Sending 10-second targeted challenge...');
    try {
      const res = await fetch('/api/adaptive-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, studentId: selectedStudentId }),
      });
      if (res.ok) {
        const result = await res.json();
        setActionStatus(`Practice round dispatched for pattern: ${result.remediationPlan?.targetPattern || pattern}!`);
        setTimeout(() => setActionStatus(null), 4000);
      }
    } catch (err) {
      setActionStatus('Failed to dispatch practice round.');
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[500px] w-full flex flex-col items-center justify-center gap-4 text-[#94a3b8]">
        <RefreshCw className="w-10 h-10 animate-spin text-[#00f0ff]" />
        <p className="text-sm font-semibold tracking-wide">Connecting to WordBlast MCP & LibreChat Analytics...</p>
      </div>
    );
  }

  const maxPauseSec = Math.max(...data.patternBreakdowns.map((p) => p.pauseDurationSec), 7.0);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 font-sans text-slate-100 space-y-6 bg-[#1e293b]/40 rounded-3xl backdrop-blur-md border border-slate-700/50 shadow-2xl">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#2a364f] border border-slate-700/70 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 uppercase tracking-wider">
              LIVE CLASSROOM HIGHLIGHTS
            </span>
            <span className="text-xs text-slate-400 font-medium">4th-Grade Reading Progress</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Student Reading Speed & Hesitation Tracker
          </h1>
          <p className="text-sm text-slate-400">Shows where students pause before speaking so you can give helpful support.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Header Student Dropdown */}
          <div className="relative">
            <select
              aria-label="Select Student User"
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="bg-[#1e293b] border border-[#3b82f6]/40 hover:border-[#3b82f6] text-white text-xs font-bold rounded-xl px-3 py-2.5 appearance-none pr-8 cursor-pointer focus:outline-none"
            >
              {STUDENT_OPTIONS.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#1e293b] text-white">
                  {st.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#60a5fa] absolute right-2.5 top-3 pointer-events-none" />
          </div>

          <button
            onClick={() => fetchFluencyData(selectedStudentId)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 text-[#60a5fa] border border-[#3b82f6]/40 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Top Grid: Recommended Focus & Student Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recommended Focus Area */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-[#2d384e] border-2 border-amber-500/40 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>RECOMMENDED PRACTICE AREA</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {data.recommendedFocus.pauseLabel}
              </span>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">
                Word Group Needing Extra Practice:{' '}
                <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-4">
                  {data.recommendedFocus.categoryLabel}
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed font-normal">
                {data.recommendedFocus.aiNarrative}
              </p>
            </div>
          </div>

          {/* Action CTA box */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RECOMMENDED ACTION</p>
                <p className="text-xs font-bold text-slate-200">{data.recommendedFocus.actionTitle}</p>
              </div>
            </div>

            <button
              onClick={() => handleSendPracticeRound(data.recommendedFocus.patternKey)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              {data.recommendedFocus.actionButtonText}
            </button>
          </div>

          {actionStatus && (
            <div className="mt-3 p-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-center animate-fadeIn">
              {actionStatus}
            </div>
          )}
        </div>

        {/* Student Profile Card */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-[#2a364f] border border-slate-700/70 shadow-xl space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">STUDENT SUMMARY</p>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase">
                {data.studentProfile.status}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white mt-2 tracking-tight">{data.studentProfile.name}</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {data.studentProfile.grade} • {data.studentProfile.room}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-[#1e293b]/70 border border-slate-700/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase">AVG READ TIME</p>
                <p className="text-xl font-black text-cyan-400 mt-0.5">{data.studentProfile.avgReadTimeSec} sec</p>
                <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">{data.studentProfile.avgReadTimeTrend}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1e293b]/70 border border-slate-700/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase">WORDS READ</p>
                <p className="text-xl font-black text-amber-400 mt-0.5">{data.studentProfile.wordsReadCount}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Across 3 games</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-200/90 leading-relaxed font-normal">
              <span className="font-bold text-cyan-300">Reading Tip: </span>
              {data.readingTip}
            </p>
          </div>
        </div>
      </div>


      {/* Bottom Section: Word Pattern Pause Breakdown */}
      <div className="p-6 rounded-2xl bg-[#2a364f] border border-slate-700/70 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-700/60">
          <div>
            <div className="flex items-center gap-2 text-white font-extrabold text-lg">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Word Reading Speed & Pauses</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                ⚡ {data.agentSource || 'LibreChat Agent'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Average pause before speaking each word group. Pauses over 1.0 second highlight word types to practice.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 self-start sm:self-center">
            GOAL: Under 1.0 second pause
          </span>
        </div>

        {/* Pattern Rows */}
        <div className="space-y-4">
          {data.patternBreakdowns.map((item) => {
            // Calculate relative bar percentage capped at 100%
            const barWidthPercent = Math.min((item.pauseDurationSec / maxPauseSec) * 100, 100);

            return (
              <div
                key={item.patternKey}
                className="p-4 rounded-xl bg-[#1e293b]/60 border border-slate-700/60 space-y-2 hover:bg-[#1e293b] transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{item.categoryLabel}</span>
                    <span className="text-slate-400 text-xs">
                      Accuracy:{' '}
                      <span className={`font-bold ${item.accuracyPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.accuracyPercent}%
                      </span>{' '}
                      ({item.wordsTriedCount} words tried)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.cluesUsedCount > 0 && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Clues used {item.cluesUsedCount}x
                      </span>
                    )}
                    <span
                      className={`font-black text-sm ${
                        item.severity === 'critical'
                          ? 'text-rose-400'
                          : item.severity === 'warning'
                          ? 'text-amber-400'
                          : 'text-cyan-400'
                      }`}
                    >
                      {item.pauseDurationSec.toFixed(2)} sec pause
                    </span>
                  </div>
                </div>

                {/* Animated Glowing Progress Bar */}
                <div className="w-full h-4 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50 relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 relative flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(barWidthPercent, 4)}%`,
                      backgroundColor: item.barColor,
                      boxShadow: `0 0 12px ${item.barColor}aa`,
                    }}
                  >
                    <span className="text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {item.pauseDurationSec.toFixed(2)}s
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
