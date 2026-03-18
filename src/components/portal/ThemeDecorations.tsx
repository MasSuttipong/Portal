"use client";

import type { PortalTheme } from "@/types/portal";

interface ThemeDecorationsProps {
  theme: PortalTheme;
}

const FLOAT_UP_THEMES = new Set(["valentine", "mothers-day", "spring"]);

const DECORATIONS: Record<string, { emoji: string; count: number; animation: string; duration: string }> = {
  christmas: { emoji: "❄", count: 20, animation: "snowfall", duration: "6s" },
  newyear: { emoji: "✨", count: 15, animation: "snowfall", duration: "5s" },
  songkran: { emoji: "💧", count: 18, animation: "waterDrop", duration: "5s" },
  valentine: { emoji: "💕", count: 12, animation: "floatHeart", duration: "7s" },
  "chinese-newyear": { emoji: "🏮", count: 8, animation: "snowfall", duration: "8s" },
  halloween: { emoji: "🎃", count: 10, animation: "snowfall", duration: "7s" },
  "mothers-day": { emoji: "🌸", count: 14, animation: "floatHeart", duration: "7s" },
  "fathers-day": { emoji: "💛", count: 10, animation: "snowfall", duration: "6s" },
  spring: { emoji: "🌷", count: 14, animation: "floatHeart", duration: "7s" },
  summer: { emoji: "☀️", count: 10, animation: "snowfall", duration: "6s" },
  autumn: { emoji: "🍂", count: 18, animation: "snowfall", duration: "6s" },
  winter: { emoji: "⛄", count: 15, animation: "snowfall", duration: "7s" },
  party: { emoji: "🎉", count: 12, animation: "snowfall", duration: "5s" },
  pride: { emoji: "🌈", count: 10, animation: "snowfall", duration: "6s" },
};

export default function ThemeDecorations({ theme }: ThemeDecorationsProps) {
  if (theme === "default") return null;

  const config = DECORATIONS[theme];
  if (!config) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: config.count }, (_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * parseFloat(config.duration);
        const size = 0.6 + Math.random() * 0.8;
        const durationMs = (parseFloat(config.duration) + Math.random() * 3) * 1000;

        return (
          <span
            key={i}
            className="absolute text-lg select-none"
            style={{
              left: `${left}%`,
              top: FLOAT_UP_THEMES.has(theme) ? "auto" : "-5%",
              bottom: FLOAT_UP_THEMES.has(theme) ? "-5%" : "auto",
              fontSize: `${size}rem`,
              animation: `${config.animation} ${durationMs}ms linear infinite`,
              animationDelay: `${delay}s`,
              opacity: 0.7,
            }}
          >
            {config.emoji}
          </span>
        );
      })}
    </div>
  );
}
