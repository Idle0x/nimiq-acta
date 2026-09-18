import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = 'w-full' }) => (
  <div className={`h-4 bg-[var(--surface2)]/50 rounded-md animate-pulse ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-[var(--surface2)]/30 border border-[var(--line)]/5 rounded-2xl p-4 flex flex-col gap-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-16 h-6 bg-[var(--surface2)]/50 rounded-full" />
      <div className="w-8 h-8 bg-[var(--surface2)]/50 rounded-full" />
    </div>
    <div className="space-y-2">
      <SkeletonLine className="w-3/4" />
      <SkeletonLine className="w-1/2" />
    </div>
    <div className="flex justify-between items-end mt-2">
      <div className="w-24 h-8 bg-[var(--surface2)]/50 rounded-md" />
      <div className="w-24 h-10 bg-[var(--surface2)]/50 rounded-xl" />
    </div>
  </div>
);

export const SkeletonEscrow: React.FC = () => (
  <div className="bg-[var(--surface2)]/30 border border-[var(--line)]/5 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 bg-[var(--surface2)]/50 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonLine className="w-1/2" />
      <SkeletonLine className="w-1/3" />
    </div>
    <div className="w-16 h-6 bg-[var(--surface2)]/50 rounded-full" />
  </div>
);

export const SkeletonPassport: React.FC = () => (
  <div className="bg-[var(--surface2)]/30 border border-[var(--line)]/5 rounded-2xl p-6 flex flex-col items-center gap-4 animate-pulse">
    <div className="w-32 h-32 bg-[var(--surface2)]/50 rounded-full" />
    <SkeletonLine className="w-1/3 h-6" />
    <div className="w-full grid grid-cols-2 gap-4 mt-4">
      <div className="h-20 bg-[var(--surface2)]/50 rounded-xl" />
      <div className="h-20 bg-[var(--surface2)]/50 rounded-xl" />
    </div>
  </div>
);
