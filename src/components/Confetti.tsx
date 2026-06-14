/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  emoji?: string;
  angle: number;
  speed: number;
}

interface ConfettiProps {
  trigger: number; // Timestamp or incrementing number
}

const COLORS = [
  'bg-rose-400',
  'bg-amber-400',
  'bg-emerald-400',
  'bg-sky-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-yellow-400'
];

const EMOJIS = ['🎉', '🌟', '🌈', '👶', '🧸', '🎈', '❤️', '🧁', '🙌', '🔥'];

export default function Confetti({ trigger }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // Generate a burst of 60 particles
    const newParticles: Particle[] = Array.from({ length: 60 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2; // Random direction
      const speed = 100 + Math.random() * 250; // Random outward velocity
      const size = 6 + Math.random() * 14;
      const useEmoji = Math.random() > 0.65;

      return {
        id: trigger + i,
        x: window.innerWidth / 2, // Sprout from center
        y: window.innerHeight / 2 - 100, // Slightly higher than center
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size,
        emoji: useEmoji ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : undefined,
        angle,
        speed
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    // Clean up particles after 3 seconds
    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id < trigger));
    }, 3200);

    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden" id="confetti-canvas-container">
      <AnimatePresence>
        {particles.map((p) => {
          // Physics/Trajectory animation
          const distance = p.speed * 1.5;
          const endX = Math.cos(p.angle) * distance;
          // Apply some gravity effect to endY
          const endY = Math.sin(p.angle) * distance + 200;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: p.x,
                y: p.y,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: p.x + endX,
                y: p.y + endY,
                scale: [1, 1.2, 0.8, 0],
                opacity: [1, 1, 0.8, 0],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 2.2 + Math.random() * 1.0,
                ease: 'easeOut',
              }}
              className="absolute"
              style={{
                left: 0,
                top: 0,
              }}
            >
              {p.emoji ? (
                <span style={{ fontSize: `${p.size + 14}px` }} className="select-none filter drop-shadow-md">
                  {p.emoji}
                </span>
              ) : (
                <div
                  className={`rounded-full shadow-sm ${p.color}`}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
