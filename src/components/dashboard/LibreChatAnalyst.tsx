'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Database,
  Send,
  Terminal,
  Bot,
  User,
  Zap,
  Play,
  Search,
  Filter,
  BarChart3,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Sliders,
  Cpu,
  PieChart,
  LineChart,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  executedSql?: string;
  timestamp: string;
  dataPayload?: any;
  viewMode?: 'graph' | 'text';
}

interface LibreChatAnalystProps {
  onRefreshData?: () => void;
}

function MessageDataGraph({ payload }: { payload: any }) {
  if (!payload || !Array.isArray(payload) || payload.length === 0) return null;

  const first = payload[0];
  if (!first || typeof first !== 'object') return null;

  // 1. Check if payload matches User Transactions Aggregation
  const isUserTransactions =
    (first.user_name !== undefined || first.username !== undefined) &&
    (first.transactions !== undefined || first.transaction_count !== undefined);

  // 2. Check if payload matches Phonics Pattern Matrix
  const isPatternMatrix =
    !isUserTransactions &&
    (first.pattern !== undefined ||
      first.word_pattern !== undefined ||
      first.category !== undefined ||
      first.phonics_category !== undefined);

  // 3. Check if payload matches Student Attempt Logs
  const isStudentAttempts =
    !isUserTransactions &&
    (first.target_word !== undefined ||
      first.pause_duration_seconds !== undefined);

  // Render User Transactions Bar Chart
  if (isUserTransactions) {
    const maxTransactions = Math.max(
      ...payload.map((d: any) => Number(d.transactions || d.transaction_count || d.count || 0)),
      1
    );
    const totalTx = payload.reduce(
      (acc: number, d: any) => acc + Number(d.transactions || d.transaction_count || d.count || 0),
      0
    );

    const gradients = [
      'bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
      'bg-gradient-to-r from-cyan-600 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]',
      'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      'bg-gradient-to-r from-amber-600 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      'bg-gradient-to-r from-rose-600 to-pink-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
    ];

    return (
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn my-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Bar Chart: Transactions per User (<code className="text-purple-300 font-mono">public.word_game_attempts</code>)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded font-mono border border-cyan-800">
              {payload.length} Users
            </span>
            <span className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded font-mono border border-purple-800">
              {totalTx} Total Tx
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {payload.map((item: any, idx: number) => {
            const userName = item.user_name || item.username || `User ${idx + 1}`;
            const txCount = Number(item.transactions || item.transaction_count || item.count || 0);
            const totalScore = item.total_score !== undefined ? Number(item.total_score) : null;
            const avgPause = item.avg_pause !== undefined ? Number(item.avg_pause) : null;
            const pct = Math.min(Math.max((txCount / maxTransactions) * 100, 5), 100);
            const barColor = gradients[idx % gradients.length];

            return (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-bold text-slate-100 text-sm">{userName}</span>
                  </span>
                  <div className="flex items-center gap-2.5 font-mono text-[11px]">
                    <span className="text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                      {txCount} transaction{txCount === 1 ? '' : 's'}
                    </span>
                    {totalScore !== null && (
                      <span className="text-emerald-400 font-semibold">{totalScore} pts</span>
                    )}
                    {avgPause !== null && (
                      <span className="text-amber-400 text-[10px]">{avgPause}s avg</span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Pattern Matrix Bar Chart
  if (isPatternMatrix) {
    const maxPause = Math.max(
      ...payload.map((d) => Number(d.avgPauseSec || d.avg_pause || d.pause_duration_seconds || 0)),
      5
    );
    return (
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn my-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Graph: Phonics Vocalization Hesitation Latency (seconds)
            </span>
          </div>
          <span className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded font-mono border border-purple-800">
            {payload.length} Patterns
          </span>
        </div>

        <div className="space-y-3">
          {payload.map((item: any, idx: number) => {
            const label = item.category || item.phonics_category || item.pattern || item.word_pattern || `Item ${idx + 1}`;
            const patternKey = item.pattern || item.word_pattern || '';
            const pause = Number(item.avgPauseSec || item.avg_pause || item.pause_duration_seconds || 0);
            const accuracy = item.accuracyPct ?? item.accuracy ?? item.accuracy_pct ?? 0;
            const pct = Math.min(Math.max((pause / maxPause) * 100, 5), 100);
            const isCritical = pause >= 7.0;
            const isWarning = pause >= 4.0 && pause < 7.0;
            const barColor = isCritical
              ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
              : isWarning
              ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]';

            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100">{label}</span>
                    {patternKey && <code className="text-[10px] text-slate-400 font-mono">({patternKey})</code>}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className={isCritical ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {pause.toFixed(2)}s pause
                    </span>
                    <span className="text-slate-400">{Number(accuracy).toFixed(0)}% acc</span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden flex items-center p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Student Attempt Timeline Chart
  if (isStudentAttempts) {
    const maxPause = Math.max(...payload.map((d) => Number(d.pause_duration_seconds || 0)), 5);
    return (
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn my-3 shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Graph: Student Vocal Pause Latency by Target Word
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Pass</span>
            <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> Miss</span>
          </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
          {payload.slice(0, 14).map((item: any, idx: number) => {
            const word = item.target_word || item.word || `Word ${idx + 1}`;
            const pauseSec = Number(item.pause_duration_seconds || 0);
            const heightPct = Math.min(Math.max((pauseSec / maxPause) * 100, 10), 100);
            const isPass = Boolean(item.is_correct);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-slate-950 text-slate-100 text-[10px] p-1.5 rounded-lg border border-slate-700 whitespace-nowrap z-20 font-mono shadow-xl pointer-events-none">
                  <strong>{word}</strong>: {pauseSec}s ({isPass ? 'Pass' : 'Miss'})
                </div>

                <div className="text-[10px] font-mono text-slate-400 group-hover:text-slate-100 font-bold">
                  {pauseSec.toFixed(1)}s
                </div>

                <div className="w-full bg-slate-950/60 rounded-t-lg flex items-end overflow-hidden h-full max-h-32">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isPass
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                        : 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                <span className="text-[10px] font-bold font-mono text-slate-300 truncate w-full text-center">
                  {word}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Generic Fallback Bar Graph for Any Result Array
  const keys = Object.keys(first);
  const labelKey = keys.find((k) => typeof first[k] === 'string') || keys[0];
  const numKey = keys.find((k) => typeof first[k] === 'number' || (!isNaN(Number(first[k])) && k !== labelKey)) || keys[1];

  if (!numKey) return null;

  const maxVal = Math.max(...payload.map((d) => Number(d[numKey] || 0)), 1);

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn my-3 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
            Graph: {numKey.replace(/_/g, ' ')} by {labelKey.replace(/_/g, ' ')}
          </span>
        </div>
        <span className="text-[10px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded font-mono border border-purple-800">
          {payload.length} Rows
        </span>
      </div>

      <div className="space-y-2.5">
        {payload.slice(0, 10).map((item: any, idx: number) => {
          const label = String(item[labelKey] || `Row ${idx + 1}`);
          const val = Number(item[numKey] || 0);
          const pct = Math.min(Math.max((val / maxVal) * 100, 5), 100);

          return (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="font-bold text-slate-100">{label}</span>
                <span className="font-mono text-purple-400 font-bold">{val}</span>
              </div>
              <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LibreChatAnalyst({ onRefreshData }: LibreChatAnalystProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [customSql, setCustomSql] = useState('SELECT user_name, target_word, pause_duration_seconds, is_correct FROM public.word_game_attempts ORDER BY attempted_at DESC LIMIT 10;');
  const [showSqlEditor, setShowSqlEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('LibreChat + ClickHouse MCP');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const toggleDetails = (msgId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  useEffect(() => {
    // Initial welcome message + auto load initial phonics matrix graph
    handleSendPrompt('Analyze phonics bottlenecks and hesitation times across all student attempts', 'phonics_analysis');
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearChat = () => {
    const clearedMsg: ChatMessage = {
      id: `cleared-${Date.now()}`,
      sender: 'assistant',
      text: `### 🧹 Chat History Cleared!

Connected to **ClickHouse** table \`public.word_game_attempts\`. Select a preset or type a question to generate fresh graphs.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([clearedMsg]);
  };

  const handleSendPrompt = async (textToSend?: string, actionType?: string, sqlOverride?: string) => {
    const promptText = textToSend || inputPrompt;
    if (!promptText.trim() && !actionType && !sqlOverride) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: sqlOverride ? `Run Custom SQL:\n\`\`\`sql\n${sqlOverride}\n\`\`\`` : promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend && !sqlOverride) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/librechat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          action: actionType || (sqlOverride ? 'custom_sql' : undefined),
          sqlQuery: sqlOverride,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          text: data.responseText,
          executedSql: data.executedSql,
          dataPayload: data.dataPayload,
          viewMode: 'graph',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (onRefreshData) onRefreshData();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            text: `⚠️ **Error**: ${data.error || 'Failed to query ClickHouse via LibreChat agent.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Network Error**: Unable to reach LibreChat API route. (${err.message})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViewMode = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, viewMode: m.viewMode === 'graph' ? 'text' : 'graph' } : m
      )
    );
  };

  return (
    <div className="w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[740px]">
      {/* Left Sidebar */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-5">
          {/* Header & Status */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  LibreChat <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">v4.2</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">ClickHouse Visual Graph Agent</p>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-semibold">ClickHouse Engine</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md font-mono border border-emerald-800/40">
                GRAPH MODE
              </span>
            </div>
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active LLM / MCP Pipeline
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500 transition-all cursor-pointer"
            >
              <option value="LibreChat + ClickHouse MCP">LibreChat + ClickHouse MCP Engine</option>
              <option value="Claude 3.5 Sonnet (SSE)">Claude 3.5 Sonnet (SSE Bridge)</option>
              <option value="Gemini 1.5 Pro (Direct)">Gemini 1.5 Pro (Direct Wire)</option>
            </select>
          </div>

          {/* Table Target Badge */}
          <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Target Table</span>
            </div>
            <code className="block text-[11px] text-purple-200 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-purple-900/40 font-mono overflow-x-auto">
              public.word_game_attempts
            </code>
          </div>

          {/* Preset Prompts & Actions */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Quick Analysis Presets</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </label>

            <div className="space-y-1.5">
              <button
                onClick={() => handleSendPrompt('Show a bar chart of each user and their transactions using the public_word_game_attempts table', 'user_transactions')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-2 group cursor-pointer"
              >
                <PieChart className="w-4 h-4 text-pink-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">User Transactions Bar Chart</span>
              </button>

              <button
                onClick={() => handleSendPrompt('Analyze phonics bottlenecks and hesitation times across all student attempts', 'phonics_analysis')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-2 group cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Phonics Hesitation Matrix Graph</span>
              </button>

              <button
                onClick={() => handleSendPrompt('Analyze Ella V. diagnostic and recent attempt logs', 'student_analysis')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-2 group cursor-pointer"
              >
                <User className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Ella V. Student Latency Graph</span>
              </button>

              <button
                onClick={() => handleSendPrompt('Generate adaptive remediation intervention for silent-k bottlenecks', 'adaptive_remediation')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Flame className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Adaptive Remediation Wave</span>
              </button>

              <button
                onClick={() => setShowSqlEditor(!showSqlEditor)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">{showSqlEditor ? 'Hide SQL Runner' : 'Run Custom SQL Query'}</span>
              </button>

              <button
                onClick={handleClearChat}
                className="w-full text-left p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-900/50 text-xs font-bold transition-all flex items-center gap-2 mt-3 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Clear Chat History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>WordBlast Visual Engine</span>
          </span>
          <span className="text-slate-400 font-mono">v1.5</span>
        </div>
      </div>

      {/* Main Chat & SQL Drawer */}
      <div className="flex-1 flex flex-col bg-slate-950 h-full overflow-hidden">
        {/* Chat Top Controls Bar */}
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs shrink-0 z-10">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>LibreChat Session</span>
            <span className="text-[10px] text-slate-400 font-mono">({messages.length} messages)</span>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* SQL Drawer */}
        {showSqlEditor && (
          <div className="p-4 bg-slate-900 border-b border-slate-800 animate-fadeIn space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>ClickHouse Direct SQL Console</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  READ ONLY
                </span>
              </div>
              <button
                onClick={() => setShowSqlEditor(false)}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Close SQL Drawer ✕
              </button>
            </div>

            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="SELECT * FROM public.word_game_attempts LIMIT 10;"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Pre-built queries:</span>
                <button
                  onClick={() => setCustomSql('SELECT word_pattern, COUNT(*) as attempts, AVG(pause_duration_seconds)::numeric(10,2) as avg_pause FROM public.word_game_attempts GROUP BY word_pattern ORDER BY avg_pause DESC;')}
                  className="hover:text-slate-200 underline cursor-pointer"
                >
                  Pattern Aggregation
                </button>
                <span>•</span>
                <button
                  onClick={() => setCustomSql('SELECT user_name, MAX(streak_count_at_attempt) as max_streak, SUM(score_earned) as total_score FROM public.word_game_attempts GROUP BY user_name ORDER BY total_score DESC;')}
                  className="hover:text-slate-200 underline cursor-pointer"
                >
                  Student Scores
                </button>
              </div>

              <button
                onClick={() => handleSendPrompt(undefined, 'custom_sql', customSql)}
                disabled={isLoading}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Query</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 max-w-4xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 border border-purple-400'
                    : 'bg-slate-800 border border-slate-700 text-purple-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5 text-purple-400" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2 max-w-[88%]">
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-sm shadow-lg'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-sm shadow-md'
                  }`}
                >
                  {/* If chatbot message has a visual graph */}
                  {msg.dataPayload ? (
                    <div className="space-y-3">
                      {/* Render Visual Graph Prominently */}
                      <MessageDataGraph payload={msg.dataPayload} />

                      {/* Expandable Details Button for Text & SQL */}
                      <div className="pt-1 border-t border-slate-800/80">
                        <button
                          onClick={() => toggleDetails(msg.id)}
                          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                        >
                          <span className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span>
                              {expandedDetails[msg.id]
                                ? 'Hide Markdown Text Analysis & Query'
                                : 'Show Text Analysis & Executed SQL Query (Expand)'}
                            </span>
                          </span>
                          {expandedDetails[msg.id] ? (
                            <ChevronUp className="w-4 h-4 text-purple-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-purple-400" />
                          )}
                        </button>
                      </div>

                      {/* Collapsible Section: Text & Executed SQL Query */}
                      {expandedDetails[msg.id] && (
                        <div className="space-y-3 pt-2 animate-fadeIn">
                          <div className="prose prose-invert prose-sm max-w-none space-y-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                            {msg.text.split('\n').map((line, idx) => {
                              if (line.startsWith('### ')) {
                                return <h3 key={idx} className="text-base font-bold text-purple-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
                              }
                              if (line.startsWith('#### ')) {
                                return <h4 key={idx} className="text-sm font-bold text-slate-100 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                              }
                              if (line.startsWith('|')) {
                                return <div key={idx} className="font-mono text-xs overflow-x-auto my-1 text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">{line}</div>;
                              }
                              if (line.startsWith('- ')) {
                                return (
                                  <li key={idx} className="list-disc ml-4 text-slate-300">
                                    {line.replace('- ', '')}
                                  </li>
                                );
                              }
                              return <p key={idx} className="my-1">{line}</p>;
                            })}
                          </div>

                          {msg.executedSql && (
                            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1 font-mono">
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                                <Code2 className="w-3.5 h-3.5" />
                                <span>Executed ClickHouse Query:</span>
                              </div>
                              <div className="text-emerald-300 bg-slate-900 p-2 rounded-xl border border-slate-800 overflow-x-auto text-[11px]">
                                {msg.executedSql}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Messages without graphs (user prompts or text-only responses) */
                    <div className="space-y-3">
                      <div className="prose prose-invert prose-sm max-w-none space-y-3">
                        {msg.text.split('\n').map((line, idx) => {
                          if (line.startsWith('### ')) {
                            return <h3 key={idx} className="text-base font-bold text-purple-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
                          }
                          if (line.startsWith('#### ')) {
                            return <h4 key={idx} className="text-sm font-bold text-slate-100 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                          }
                          if (line.startsWith('|')) {
                            return <div key={idx} className="font-mono text-xs overflow-x-auto my-1 text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">{line}</div>;
                          }
                          if (line.startsWith('- ')) {
                            return (
                              <li key={idx} className="list-disc ml-4 text-slate-300">
                                {line.replace('- ', '')}
                              </li>
                            );
                          }
                          return <p key={idx} className="my-1">{line}</p>;
                        })}
                      </div>

                      {msg.executedSql && (
                        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1 font-mono">
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Executed ClickHouse Query:</span>
                          </div>
                          <div className="text-emerald-300 bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-x-auto text-[11px]">
                            {msg.executedSql}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className={`text-[10px] text-slate-400 px-2 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 max-w-2xl animate-pulse">
              <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                <span>Generating ClickHouse Graph & Query Results...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-purple-500 transition-all shadow-inner"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask LibreChat to graph phonics patterns, student latency, or attempt stats..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 shrink-0 shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
