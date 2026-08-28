'use client';

import React from 'react';
import { FluencyTrackerDashboard } from '@/components/dashboard/FluencyTrackerDashboard';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Sparkles } from 'lucide-react';

export default function FluencyTrackerPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col relative overflow-hidden py-6 px-4 md:px-8">
      {/* Top Bar Navigation Back */}
      <div className="max-w-7xl w-full mx-auto mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to WordBlast Game</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ffd166] border border-[#183153] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#7657e8]" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-wide">
            Word<span className="text-red-400">Blast</span> Fluency Hub
          </span>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto">
        <FluencyTrackerDashboard />
      </div>
    </main>
  );
}
