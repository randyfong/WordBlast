'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, Award } from 'lucide-react';

export interface HighScoreEntry {
  id: string;
  name: string;
  score: number;
  streak: number;
  timestamp?: string;
}

interface ClassroomLeaderboardProps {
  initialScores?: HighScoreEntry[];
  limit?: number;
  className?: string;
}

export const ClassroomLeaderboard: React.FC<ClassroomLeaderboardProps> = ({
  initialScores,
  limit = 5,
  className = ''
}) => {
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(initialScores || []);
  const [loading, setLoading] = useState(!initialScores);
  const [dataSource, setDataSource] = useState<string>('public.word_game_attempts');

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const json = await res.json();
        if (json.highScores) {
          setHighScores(json.highScores);
        }
        if (json.source) {
          setDataSource(json.source);
        }
      }
    } catch (err) {
      console.error('Failed to load leaderboard from /api/leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, []);

  const displayScores = highScores.slice(0, limit);

  return (
    <div
      className={`w-full max-w-lg mx-auto bg-[#232936] border border-slate-700/60 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl font-sans ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Bookmark className="w-6 h-6 text-amber-400 fill-amber-400 stroke-amber-400" />
            <Award className="w-3.5 h-3.5 text-[#232936] absolute top-1.5 font-bold" />
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            Classroom Leaderboard
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-semibold text-slate-400/90">
            Top Scores
          </span>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {loading && displayScores.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium animate-pulse">
            Loading leaderboard from ClickHouse...
          </div>
        ) : displayScores.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No score records found.
          </div>
        ) : (
          displayScores.map((item, idx) => {
            const isFirst = idx === 0;
            return (
              <div
                key={item.id || idx}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                  isFirst
                    ? 'bg-[#2b3140] border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-[#1c212c]/90 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Rank & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`font-black text-base md:text-lg w-6 shrink-0 ${
                      isFirst ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {idx + 1}.
                  </span>
                  <span className="font-extrabold text-white text-sm md:text-base tracking-wider truncate uppercase">
                    {item.name}
                  </span>
                </div>

                {/* Streak & Score */}
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs md:text-sm font-semibold text-slate-400/90 whitespace-nowrap">
                    {item.streak}x streak
                  </span>
                  <span className="font-black text-amber-400 text-sm md:text-base tracking-tight whitespace-nowrap">
                    {item.score.toLocaleString()} pts
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Data Badge */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ClickHouse Input Table: <code className="text-amber-300/90 font-mono">public_word_game_attempts</code>
        </span>
        <span className="text-slate-500">Live Sync</span>
      </div>
    </div>
  );
};
