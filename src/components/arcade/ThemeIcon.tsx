'use client';

import React from 'react';
import { 
  Castle, 
  Waves, 
  Trees, 
  Rocket, 
  Footprints, 
  Bot, 
  Pyramid,
  Trophy,
  Sparkles
} from 'lucide-react';

interface ThemeIconProps {
  themeId: string;
  className?: string;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({ themeId, className = "w-6 h-6" }) => {
  switch (themeId) {
    case 'castle_quest':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#ffd166] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Castle className={className} />
        </div>
      );
    case 'ocean_mystery':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#67c8f4] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Waves className={className} />
        </div>
      );
    case 'forest_enchanted':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#3fcf8e] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Trees className={className} />
        </div>
      );
    case 'space_voyage':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#7657e8] text-white border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Rocket className={className} />
        </div>
      );
    case 'jurassic_safari':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#ff8e7f] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Footprints className={className} />
        </div>
      );
    case 'cyber_city':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#00f0ff] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Bot className={className} />
        </div>
      );
    case 'pyramid_archaeology':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#ffb700] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Pyramid className={className} />
        </div>
      );
    case 'warriors_hoops':
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#ffd166] text-[#006bb6] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Trophy className={className} />
        </div>
      );
    default:
      return (
        <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-[#ffd166] text-[#183153] border-2 border-[#183153] shadow-[2px_2px_0_#183153]">
          <Sparkles className={className} />
        </div>
      );
  }
};
