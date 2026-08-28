'use client';

import React from 'react';
import { HelpCircle, X, Volume2, Sparkles } from 'lucide-react';

interface PhonicsLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhonicsLegend: React.FC<PhonicsLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#fffaf0] border-4 border-[#183153] rounded-3xl p-5 md:p-7 shadow-[0_10px_0_#183153] overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#183153]/15 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffd166] border-2 border-[#183153] flex items-center justify-center shadow-[2px_2px_0_#183153]">
              <Sparkles className="w-5 h-5 text-[#7657e8]" />
            </div>
            <div>
              <h3 className="display-font text-2xl font-black text-[#183153]">
                Color Reading Guide
              </h3>
              <p className="text-xs font-extrabold text-[#55708f]">
                How color highlights help you sound out tricky words!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border-2 border-[#183153] text-[#183153] hover:bg-[#ff8e7f] hover:text-white transition-all cursor-pointer shadow-[2px_2px_0_#183153]"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend Cards */}
        <div className="space-y-3.5">
          {/* Red / Silent Letters */}
          <div className="p-4 rounded-2xl bg-[#ffe7e3] border-2 border-[#ff6b6b] flex items-start gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-red-500 font-mono font-black text-red-500 text-lg shadow-sm shrink-0">
              K N W G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#c84343] text-base">🔴 Red = Silent Letters</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">SKIP SOUND</span>
              </div>
              <p className="text-xs md:text-sm font-bold text-[#455d78] mt-1 leading-relaxed">
                <strong>How to pronounce:</strong> Keep your lips closed for this letter! For example in <span className="underline decoration-red-400 font-black">K</span>NIGHT or <span className="underline decoration-red-400 font-black">W</span>RIST, the first letter makes <em>no sound at all</em>. Start speaking right at the next letter!
              </p>
            </div>
          </div>

          {/* Green / End Consonants & Standard Ending Letters */}
          <div className="p-4 rounded-2xl bg-[#dff8eb] border-2 border-[#3fcf8e] flex items-start gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-emerald-500 font-mono font-black text-emerald-600 text-lg shadow-sm shrink-0">
              T D S M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#167650] text-base">🟢 Green = Ending Consonants & Blends</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">STRONG ENDING</span>
              </div>
              <p className="text-xs md:text-sm font-bold text-[#455d78] mt-1 leading-relaxed">
                <strong>How to pronounce:</strong> Pronounce these ending letters crisp and clear to lock in the finish of the word! For example, finish KNIGH<span className="underline decoration-emerald-500 font-black">T</span> with a sharp &quot;T&quot; sound or BLAS<span className="underline decoration-emerald-500 font-black">T</span> with a strong ending sound.
              </p>
            </div>
          </div>

          {/* Yellow / Vowel Teams */}
          <div className="p-4 rounded-2xl bg-[#fff1bd] border-2 border-[#ffd166] flex items-start gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-yellow-500 font-mono font-black text-yellow-600 text-lg shadow-sm shrink-0">
              EA OA AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#9a6a00] text-base">🟡 Yellow = Vowel Teams</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">ONE VOWEL SOUND</span>
              </div>
              <p className="text-xs md:text-sm font-bold text-[#455d78] mt-1 leading-relaxed">
                <strong>How to pronounce:</strong> Two vowels team up to make <em>one long sound</em>! Remember: <em>&ldquo;When two vowels go walking, the first one does the talking!&rdquo;</em> (e.g. B<span className="underline decoration-yellow-500 font-black">EA</span>CON sounds like &quot;BEE-con&quot;).
              </p>
            </div>
          </div>

          {/* Cyan / Consonant Chunks */}
          <div className="p-4 rounded-2xl bg-[#eaf8ff] border-2 border-[#67c8f4] flex items-start gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-cyan-500 font-mono font-black text-cyan-600 text-lg shadow-sm shrink-0">
              TR STR PL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#006f9e] text-base">🔵 Blue/Cyan = Consonant Blends</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">SMOOTH BLEND</span>
              </div>
              <p className="text-xs md:text-sm font-bold text-[#455d78] mt-1 leading-relaxed">
                <strong>How to pronounce:</strong> Slide these consonant sounds smoothly together in one quick breath without pausing (e.g. <span className="underline decoration-cyan-400 font-black">STR</span>EAM or <span className="underline decoration-cyan-400 font-black">PL</span>ANET).
              </p>
            </div>
          </div>

          {/* Purple / Digraphs */}
          <div className="p-4 rounded-2xl bg-[#f5eefb] border-2 border-[#7657e8] flex items-start gap-4">
            <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-purple-500 font-mono font-black text-purple-600 text-lg shadow-sm shrink-0">
              PH SH CH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#5137b9] text-base">🟣 Purple/Pink = Digraphs</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">BRAND NEW SOUND</span>
              </div>
              <p className="text-xs md:text-sm font-bold text-[#455d78] mt-1 leading-relaxed">
                <strong>How to pronounce:</strong> These letter pairs join together to create a <em>brand new sound</em>! <span className="font-black">PH</span> makes an &quot;F&quot; sound (DOL<span className="underline font-black">PH</span>IN), <span className="font-black">SH</span> says &quot;Shhh!&quot;, and <span className="font-black">CH</span> sounds like a train &quot;Chug-chug!&quot;.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 p-3 rounded-2xl bg-white border-2 border-[#183153]/15 text-center text-xs font-bold text-[#55708f]">
          💡 <strong className="text-[#183153]">Pro Tip:</strong> When you pause for over 1.5 seconds during a game, the word automatically pops into these colored chunks to help you blast it!
        </div>
      </div>
    </div>
  );
};
