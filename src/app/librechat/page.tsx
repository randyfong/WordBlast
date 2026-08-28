'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Sparkles,
  Database,
  Search,
  Filter,
  BarChart3,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  User,
  Activity,
  Layers,
  Sliders,
  Table as TableIcon,
  Bot,
} from 'lucide-react';
import { LibreChatAnalyst } from '@/components/dashboard/LibreChatAnalyst';

export default function LibreChatPage() {
  const [activeTab, setActiveTab] = useState<'AI_ANALYST' | 'CLICKHOUSE_EXPLORER'>('AI_ANALYST');
  const [attemptsData, setAttemptsData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [patternBreakdown, setPatternBreakdown] = useState<any[]>([]);
  const [studentSummary, setStudentSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [patternFilter, setPatternFilter] = useState<string>('ALL');

  const fetchClickHouseData = async () => {
    setIsLoading(true);
    try {
      let url = '/api/clickhouse/attempts?limit=100';
      if (patternFilter !== 'ALL') {
        url += `&wordPattern=${encodeURIComponent(patternFilter)}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setAttemptsData(data.attempts || []);
        setSummaryStats(data.summary || null);
        setPatternBreakdown(data.patternBreakdown || []);
        setStudentSummary(data.studentSummary || []);
      }
    } catch (err) {
      console.error('Failed to fetch ClickHouse data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClickHouseData();
  }, [patternFilter]);

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col relative overflow-hidden py-6 px-4 md:px-8">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <div className="max-w-7xl w-full mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Arcade Game</span>
          </Link>

          <Link
            href="/fluency-tracker"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Fluency Tracker</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="font-mono text-purple-300">public.word_game_attempts</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl w-full mx-auto mb-8 z-10">
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LibreChat AI Telemetry Engine</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                ClickHouse <span className="text-purple-400">Word Game</span> Attempt Analytics
              </h1>
              <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl">
                Analyze student vocalization pause latency, accuracy rates, and phonics hesitation patterns in <code className="text-purple-300 font-mono text-xs bg-slate-950 px-2 py-0.5 rounded">public.word_game_attempts</code> using LibreChat AI.
              </p>
            </div>

            <button
              onClick={fetchClickHouseData}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync ClickHouse Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards Grid */}
      {summaryStats && (
        <div className="max-w-7xl w-full mx-auto mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Total Attempts</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {summaryStats.totalAttempts}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Logged in ClickHouse table</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Overall Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400">
              {summaryStats.overallAccuracyPct}%
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Pass vs miss attempts</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Avg Vocal Pause</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-amber-400">
              {summaryStats.avgPauseSec}s
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Latency before first phoneme</div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Active Students</span>
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-cyan-400">
              {summaryStats.totalStudents}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Roster tracked in telemetry</div>
          </div>
        </div>
      )}

      {/* Main View Tabs */}
      <div className="max-w-7xl w-full mx-auto space-y-6 z-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('AI_ANALYST')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'AI_ANALYST'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>LibreChat AI Analyst</span>
            </button>

            <button
              onClick={() => setActiveTab('CLICKHOUSE_EXPLORER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'CLICKHOUSE_EXPLORER'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>ClickHouse Data Explorer</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'AI_ANALYST' ? (
          <LibreChatAnalyst onRefreshData={fetchClickHouseData} />
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Search & Pattern Filter Toolbar */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full md:w-96 bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 text-xs">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student, word, or phonics pattern..."
                  className="bg-transparent text-slate-100 placeholder-slate-400 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Filter className="w-4 h-4 text-purple-400" />
                  <span>Pattern:</span>
                </div>
                <select
                  value={patternFilter}
                  onChange={(e) => setPatternFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Patterns</option>
                  <option value="silent-k">Silent K (KN-)</option>
                  <option value="silent-w">Silent W (WR-)</option>
                  <option value="blends">Standard Blends</option>
                  <option value="vowel-team-oa">Vowel Team (OA)</option>
                  <option value="vowel-team-ai">Vowel Team (AI)</option>
                  <option value="digraph-sh">Digraph (SH)</option>
                  <option value="digraph-ph">Digraph (PH)</option>
                </select>

                <button
                  onClick={fetchClickHouseData}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </div>

            {/* User Transactions Bar Chart Section */}
            {studentSummary.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                      User Transactions Bar Chart (<code className="text-purple-300 font-mono">public.word_game_attempts</code>)
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
                    {studentSummary.length} Labeled Users
                  </span>
                </div>

                <div className="space-y-4 pt-1">
                  {(() => {
                    const maxTx = Math.max(...studentSummary.map((s) => Number(s.totalAttempts || 0)), 1);
                    const gradients = [
                      'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
                      'bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]',
                      'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
                      'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
                      'bg-gradient-to-r from-rose-600 via-pink-500 to-purple-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
                    ];

                    return studentSummary.map((student, idx) => {
                      const pct = Math.min(Math.max((student.totalAttempts / maxTx) * 100, 5), 100);
                      const barColor = gradients[idx % gradients.length];

                      return (
                        <div key={student.userName} className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-300 font-medium">
                            <span className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400 text-xs font-bold font-mono">
                                #{idx + 1}
                              </span>
                              <span className="font-bold text-slate-100 text-sm">{student.userName}</span>
                            </span>
                            <div className="flex items-center gap-3 font-mono text-[11px]">
                              <span className="text-purple-300 font-bold bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-800">
                                {student.totalAttempts} transaction{student.totalAttempts === 1 ? '' : 's'}
                              </span>
                              <span className="text-emerald-400 font-semibold">{student.totalScore} pts</span>
                              <span className="text-amber-300 text-[10px]">{student.avgPauseSec}s avg pause</span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-950 h-4.5 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-800">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Phonics Pattern Matrix Summary */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Aggregated Phonics Hesitation Breakdown</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {patternBreakdown.map((p) => (
                  <div
                    key={p.patternKey}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{p.categoryLabel}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase font-mono ${
                          p.severity === 'critical'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : p.severity === 'warning'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {p.severity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Avg Pause: <strong className="text-slate-200">{p.avgPauseSec}s</strong></span>
                      <span>Accuracy: <strong className="text-slate-200">{p.accuracyPct}%</strong></span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          p.severity === 'critical'
                            ? 'bg-rose-500'
                            : p.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(p.accuracyPct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Attempts Data Table */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span>ClickHouse Table Rows (`public.word_game_attempts`)</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {attemptsData.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Attempted At</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Target Word</th>
                      <th className="py-3 px-4">Phonics Category</th>
                      <th className="py-3 px-4">Pause Sec</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Score Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {attemptsData.map((row) => (
                      <tr key={row.attempt_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {new Date(row.attempted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-100">{row.user_name}</td>
                        <td className="py-3 px-4 font-mono font-bold text-purple-300">{row.target_word}</td>
                        <td className="py-3 px-4 text-slate-300">{row.phonics_category || row.word_pattern}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-amber-300">
                          {row.pause_duration_seconds}s
                        </td>
                        <td className="py-3 px-4">
                          {row.is_correct ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800">
                              <AlertTriangle className="w-3 h-3" /> Miss
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          +{row.score_earned}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
