"use client";

import { useState } from "react";

interface ThemeSongPlayerProps {
  songUrl?: string;
  songLabel?: string;
  userColor: string;
  editable?: boolean;
  onEdit?: () => void;
}

export default function ThemeSongPlayer({
  songUrl,
  songLabel = "a wallet draining .wav",
  userColor,
  editable = false,
  onEdit,
}: ThemeSongPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (!songUrl) return;
    setIsPlaying(!isPlaying);
    // TODO: Implement actual audio playing
  };

  return (
    <div
      className="border-t border-dashed border-[var(--border)] py-3 px-4"
      style={{
        background: "repeating-linear-gradient(0deg, #1a1413 0 2px, #14100f 2px 4px)",
      }}
    >
      <div
        className="text-[10px] uppercase tracking-wider font-bold mb-1.5"
        style={{ color: userColor }}
      >
        {"\u25B6"} profile theme song
        {editable && (
          <button
            onClick={onEdit}
            className="text-[var(--text-muted)] ml-2 cursor-pointer hover:text-[var(--text)] font-normal"
          >
            change
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={handlePlay}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] cursor-pointer transition-transform hover:scale-105 flex-shrink-0"
          style={{
            background: userColor,
            boxShadow: `0 0 12px ${userColor}55`,
          }}
        >
          {isPlaying ? "\u23F8" : "\u25B6"}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-[var(--text)] font-bold text-[11px] truncate">
            {songLabel || "no song set"}
          </div>
          <div className="text-[var(--text-muted)] text-[10px]">
            {songUrl ? "2:14 \u00B7 pinned" : "add a theme song"}
          </div>
        </div>

        {/* Sound wave visualization */}
        <div className="flex gap-[2px] items-end h-[14px]">
          {[30, 70, 100, 50, 80].map((height, i) => (
            <span
              key={i}
              className={`w-[2px] ${isPlaying ? "animate-pulse" : ""}`}
              style={{
                background: userColor,
                height: `${height}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
