"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function DNAScoreRing({ score, size = 140, strokeWidth = 10, label, sublabel }: Props) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const color =
    score >= 75 ? "#7c5cfc" : score >= 50 ? "#a78bfa" : score >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1e1e28"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            /100
          </span>
        </div>
      </div>
      {label && <p className="text-sm font-semibold text-center">{label}</p>}
      {sublabel && <p className="text-xs text-muted-foreground text-center">{sublabel}</p>}
    </div>
  );
}
