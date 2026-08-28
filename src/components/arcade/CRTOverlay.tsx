'use client';

import React from 'react';

export const CRTOverlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-[1.75rem] border-[6px] border-[#183153] bg-[#142a4b] shadow-[0_8px_0_#0e203b]">
      {children}
    </div>
  );
};
