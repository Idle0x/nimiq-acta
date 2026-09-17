'use client';
import React, { useEffect, useState } from 'react';

interface TrustRingProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

const TrustRing: React.FC<TrustRingProps> = ({ score, size = 160, label = 'Trust Score' }) => {
  const [mounted, setMounted] = useState(false);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeScore = Math.max(0, Math.min(100, score));
  
  // State for animated offset
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    setMounted(true);
    // Slight delay before animating
    const timer = setTimeout(() => {
      const targetOffset = circumference - (safeScore / 100) * circumference;
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [safeScore, circumference]);

  let colorClass = 'text-rose-400';
  let glowClass = 'drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]'; // rose-400
  if (safeScore >= 60) {
    colorClass = 'text-emerald-400';
    glowClass = 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'; // emerald-400
  } else if (safeScore >= 30) {
    colorClass = 'text-amber-300';
    glowClass = 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'; // amber-300
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out ${glowClass}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-bold tnum ${colorClass}`}>{safeScore}</span>
        {label && <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
};

export default TrustRing;
