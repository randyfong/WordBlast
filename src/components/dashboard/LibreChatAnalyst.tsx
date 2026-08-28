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

  const keys = Object.keys(first);

  // 1. Identify Label Column (string/identifier)
  const labelKey =
    keys.find((k) => ['user_name', 'username', 'student', 'user', 'target_word', 'word', 'phonics_category', 'category', 'categoryLabel', 'word_pattern', 'pattern'].includes(k)) ||
    keys.find((k) => typeof first[k] === 'string') ||
    keys[0];

  // 2. Identify Primary Metric Column to plot as bar length
  const numericKeys = keys.filter((k) => {
    const val = first[k];
    return (typeof val === 'number' || (!isNaN(Number(val)) && val !== '')) && k !== labelKey && k !== 'id' && !k.endsWith('_id');
  });

  // Prioritize primary aggregated metrics from the SQL query
  const metricKey =
    numericKeys.find((k) => ['transactions', 'total_attempts', 'attempts', 'attempt_count', 'count', 'total_score', 'score_earned', 'accuracy_pct', 'accuracyPct', 'accuracy', 'avg_pause', 'avgPauseSec', 'pause_duration_seconds'].includes(k)) ||
    numericKeys[0] ||
    keys[1];

  if (!metricKey || !labelKey) return null;

  // Determine Title and Unit
  let unit = '';
  let metricTitle = metricKey.replace(/_/g, ' ');

  if (['transactions', 'total_attempts', 'attempts', 'attempt_count', 'count'].includes(metricKey)) {
    unit = 'tx';
    metricTitle = 'Transaction / Attempt Count';
  } else if (['total_score', 'score_earned', 'score', 'pts'].includes(metricKey)) {
    unit = 'pts';
    metricTitle = 'Total Arcade Score';
  } else if (['accuracy_pct', 'accuracyPct', 'accuracy'].includes(metricKey)) {
    unit = '%';
    metricTitle = 'Accuracy Rate';
  } else if (['avg_pause', 'avgPauseSec', 'pause_duration_seconds', 'pause'].includes(metricKey)) {
    unit = 's';
    metricTitle = 'Vocal Pause Latency';
  }

  const maxVal = Math.max(...payload.map((d: any) => Number(d[metricKey] || 0)), 1);
  const totalVal = payload.reduce((acc: number, d: any) => acc + Number(d[metricKey] || 0), 0);

  const gradients = [
    'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    'bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    'bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    'bg-gradient-to-r from-rose-600 via-pink-500 to-purple-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]',
  ];

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn my-3 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
            Graph: {metricTitle} by {labelKey.replace(/_/g, ' ')} (<code className="text-purple-300 font-mono">public.word_game_attempts</code>)
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            {payload.length} Rows
          </span>
          <span className="text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
            {unit === '%' ? `${(totalVal / payload.length).toFixed(1)}% avg` : `${totalVal.toLocaleString()} total ${unit}`}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {payload.slice(0, 15).map((item: any, idx: number) => {
          const label = String(item[labelKey] || `Row ${idx + 1}`);
          const rawVal = item[metricKey];
          const val = typeof rawVal === 'number' ? rawVal : Number(rawVal || 0);
          const pct = Math.min(Math.max((val / maxVal) * 100, 5), 100);
          const barColor = gradients[idx % gradients.length];

          // Secondary metric badges
          const score = item.total_score !== undefined || item.score_earned !== undefined ? Number(item.total_score ?? item.score_earned) : null;
          const pause = item.avg_pause !== undefined || item.pause_duration_seconds !== undefined ? Number(item.avg_pause ?? item.pause_duration_seconds) : null;
          const passes = item.pass_count !== undefined ? Number(item.pass_count) : null;

          return (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 text-[10px] font-bold font-mono">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-100 text-sm">{label}</span>
                </span>

                <div className="flex items-center gap-2.5 font-mono text-[11px]">
                  <span className="text-purple-300 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                    {val.toLocaleString()} {unit}
                  </span>
                  {score !== null && metricKey !== 'total_score' && metricKey !== 'score_earned' && (
                    <span className="text-emerald-400 font-semibold">{score.toLocaleString()} pts</span>
                  )}
                  {pause !== null && metricKey !== 'avg_pause' && metricKey !== 'pause_duration_seconds' && (
                    <span className="text-amber-400 text-[10px]">{pause}s pause</span>
                  )}
                  {passes !== null && (
                    <span className="text-cyan-400 text-[10px]">{passes} passes</span>
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
