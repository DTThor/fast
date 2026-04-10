import { useMemo } from 'react';

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#facc15'];

interface Piece {
  id: number;
  x: number;
  color: string;
  w: number;
  h: number;
  radius: string;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => {
    const shape = Math.floor(Math.random() * 3); // 0=square, 1=circle, 2=rect
    const base = 6 + Math.random() * 8;
    return {
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: shape === 2 ? base * 2.2 : base,
      h: base,
      radius: shape === 1 ? '50%' : shape === 2 ? '2px' : '2px',
      duration: 3.5 + Math.random() * 4,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 120,
      rotate: Math.random() * 360,
    };
  });
}

export default function Confetti() {
  const pieces = useMemo(() => makePieces(55), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-16px',
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: p.radius,
            opacity: 0.75,
            animation: `confettiFall ${p.duration}s ${p.delay}s linear infinite`,
            ['--drift' as string]: `${p.drift}px`,
            ['--rotate' as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
