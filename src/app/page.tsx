'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, BarChart2, Sparkles, Volume2, Eye, PartyPopper, Star } from 'lucide-react';
import { ArcadeCabinet } from '@/components/arcade/ArcadeCabinet';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ARCADE' | 'DASHBOARD'>('ARCADE');
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    const firstNames = [
      'Maya', 'Leo', 'Sofia', 'Ethan', 'Chloe', 'Noah', 'Ava', 'Liam',
      'Emma', 'Jackson', 'Aria', 'Lucas', 'Oliver', 'Amelia', 'Kai',
      'Harper', 'Mason', 'Evelyn', 'Elijah', 'Ella', 'James', 'Scarlett',
      'Benjamin', 'Grace', 'Logan', 'Chloe', 'Alexander', 'Zoey', 'Sebastian'
    ];
    const initials = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'J.', 'K.', 'L.', 'M.', 'N.', 'P.', 'R.', 'S.', 'T.', 'V.', 'W.'];

    // Check session storage or generate new random name
    let assigned = sessionStorage.getItem('wordblast_student_name');
    if (!assigned) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const init = initials[Math.floor(Math.random() * initials.length)];
      assigned = `${fn} ${init}`;
      sessionStorage.setItem('wordblast_student_name', assigned);
    }
    setStudentName(assigned);
  }, []);

  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#183153] flex flex-col relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[#eaf8ff] pointer-events-none" />
      <div className="absolute top-24 left-[5%] w-24 h-10 rounded-full bg-white/80 pointer-events-none after:absolute after:w-12 after:h-12 after:rounded-full after:bg-white after:-top-5 after:left-5" />
      <div className="absolute top-36 right-[8%] w-32 h-11 rounded-full bg-white/80 pointer-events-none after:absolute after:w-14 after:h-14 after:rounded-full after:bg-white after:-top-6 after:right-7" />

      {/* Navigation Bar */}
      <header className="w-full border-b-2 border-[#183153]/10 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 -rotate-6 rounded-2xl bg-[#ffd166] border-2 border-[#183153] flex items-center justify-center shadow-[3px_3px_0_#183153]">
              <Sparkles className="w-6 h-6 text-[#7657e8]" />
            </div>
            <div>
              <div className="display-font text-xl font-bold leading-none text-[#183153]">
                Word<span className="text-[#ff6b6b]">Blast!</span>
              </div>
              <div className="text-xs font-bold text-[#55708f] mt-0.5">
                Read it. Say it. Blast it!
              </div>
            </div>
          </div>

          {/* Student Welcome Pill & Mode Switcher */}
          <div className="flex items-center gap-3">
            {studentName && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#ffd166] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
                <Star className="w-4 h-4 fill-[#183153] text-[#183153]" />
                <span className="text-xs font-extrabold text-[#183153]">
                  Welcome {studentName}!
                </span>
              </div>
            )}

            <div className="flex items-center p-1 rounded-2xl bg-[#eaf8ff] border-2 border-[#183153]/10" aria-label="Choose a view">
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-[#7657e8] text-white shadow-[0_3px_0_#5137b9]'
                    : 'text-[#55708f] hover:text-[#183153]'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Grown-ups</span>
              </button>

              <button
                onClick={() => setActiveTab('ARCADE')}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'ARCADE'
                    ? 'bg-[#ff6b6b] text-white shadow-[0_3px_0_#c84343]'
                    : 'text-[#55708f] hover:text-[#183153]'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-7 md:px-8 md:py-10 flex flex-col items-center justify-center">
        {activeTab === 'ARCADE' ? (
          <div className="w-full space-y-8 animate-fadeIn">
            <section className="text-center max-w-3xl mx-auto">
              {studentName && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffd166] border-2 border-[#183153] text-sm font-black text-[#183153] shadow-[0_3px_0_#183153] mb-3">
                  <Star className="w-4 h-4 fill-[#183153] text-[#183153]" />
                  <span>Welcome {studentName}!</span>
                </div>
              )}
              <h1 className="display-font text-4xl md:text-6xl font-bold tracking-tight text-[#183153] leading-[0.95]">
                Ready to blast<br className="hidden sm:block" /> some <span className="text-[#ff6b6b]">words?</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl font-bold text-[#55708f]">
                Read the word. Say it out loud. Watch it go POP!
              </p>
            </section>
            {/* Arcade Cabinet */}
            <ArcadeCabinet studentName={studentName} />

            {/* Explainer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mx-auto">
              <div className="p-5 rounded-3xl bg-[#ffe7e3] border-2 border-[#ff6b6b]/25 rotate-[-1deg]">
                <div className="flex items-center gap-2 text-[#c84343] font-extrabold text-base mb-1">
                  <Volume2 className="w-4 h-4" />
                  <span>1. Say the word</span>
                </div>
                <p className="text-sm font-semibold text-[#455d78]">
                  Use your big, clear reading voice. The microphone is listening!
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#fff1bd] border-2 border-[#e2a928]/25 rotate-[1deg]">
                <div className="flex items-center gap-2 text-[#9a6a00] font-extrabold text-base mb-1">
                  <Eye className="w-4 h-4" />
                  <span>2. Get a clue</span>
                </div>
                <p className="text-sm font-semibold text-[#455d78]">
                  Need help? The word breaks into colorful chunks you can read.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-[#dff8eb] border-2 border-[#3fcf8e]/25 rotate-[-1deg]">
                <div className="flex items-center gap-2 text-[#167650] font-extrabold text-base mb-1">
                  <PartyPopper className="w-4 h-4" />
                  <span>3. Build a streak</span>
                </div>
                <p className="text-sm font-semibold text-[#455d78]">
                  Keep going! Each word you blast adds to your winning streak.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full animate-fadeIn">
            <TeacherDashboard />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t-2 border-[#183153]/10 py-5 text-center text-sm font-bold text-[#55708f] bg-white/80">
        <div>Made with ✨ for growing readers</div>
      </footer>
    </main>
  );
}
