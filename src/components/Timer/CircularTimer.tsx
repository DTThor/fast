import { useEffect, useState } from 'react';
import { formatDuration } from '../../utils/format';

interface CircularTimerProps {
  elapsedMs: number;
  targetMs: number;
  isRunning: boolean;
  size?: number;
  strokeWidth?: number;
}

export default function CircularTimer({
  elapsedMs,
  targetMs,
  isRunning,
  size = 280,
  strokeWidth = 14,
}: CircularTimerProps) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(elapsedMs / targetMs, 1);
  const offset = circumference * (1 - progress);

  const overTarget = elapsedMs > targetMs;
  const elapsedHours = elapsedMs / 3600000;

  // Color based on progress
  let strokeColor = '#f97316';
  if (progress > 0.75) strokeColor = '#fb923c';
  if (progress >= 1) strokeColor = '#22c55e';

  // Gradient id unique to avoid conflicts
  const gradientId = 'timerGradient';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor={overTarget ? '#22c55e' : '#fbbf24'} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progress >= 1 ? strokeColor : `url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="timer-ring drop-shadow-lg"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {overTarget && (
          <span className="text-xs font-semibold text-green-500 mb-1 tracking-widest uppercase">
            Goal Reached!
          </span>
        )}
        <span className="text-4xl font-mono font-bold text-slate-800 dark:text-white tracking-tight">
          {formatDuration(elapsedMs)}
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {elapsedHours.toFixed(1)}h / {(targetMs / 3600000).toFixed(0)}h goal
        </span>
        {isRunning && (
          <span className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            fasting
          </span>
        )}
      </div>
    </div>
  );
}
