'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  size: number;
  duration: number;
}

const COLORS = ['#00e5cc', '#ff3cac', '#9c6bff', '#f59e0b', '#38bdf8', '#34d399', '#ffffff'];

export function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const ps: Particle[] = Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20, // 40–60% of container width
      y: 30 + Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * 360,
      size: 4 + Math.random() * 6,
      duration: 0.8 + Math.random() * 0.8,
    }));
    setParticles(ps);
    const t = setTimeout(() => setParticles([]), 2200);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            transform: `rotate(${p.angle}deg)`,
            animation: `confetti-fly ${p.duration}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.15}s`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fly {
          0%   { transform: rotate(var(--r, 0deg)) translateY(0) scale(1); opacity: 1; }
          80%  { opacity: 0.9; }
          100% { transform: rotate(calc(var(--r, 0deg) + 720deg)) translateY(120px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
