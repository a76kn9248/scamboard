"use client";

import { useState } from "react";

interface UserProfile {
  nickname: string;
  bio: string | null;
  profileColor: string | null;
  title: string | null;
  xp: number;
  mood?: string;
  currentlyDoing?: string;
  specialty?: string;
  themeSongUrl?: string;
  themeSongLabel?: string;
}

interface ProfileCustomizerProps {
  profile: UserProfile;
  color: string;
  onUpdate: (updates: Partial<UserProfile>) => void;
}

const ALLOWED_COLORS = [
  "#ff3b6c", "#ff3b9a", "#ff7a3a", "#ffc547", "#6ce28a", "#5cd0e2",
  "#b58aff", "#7c5cff", "#34d399", "#22d3ee", "#f472b6", "#fb923c",
  "#facc15", "#60a5fa",
];

export default function ProfileCustomizer({ profile, color, onUpdate }: ProfileCustomizerProps) {
  const [bio, setBio] = useState(profile.bio || "");
  const [selectedColor, setSelectedColor] = useState(profile.profileColor || color);
  const [mood, setMood] = useState(profile.mood || "");
  const [currentlyDoing, setCurrentlyDoing] = useState(profile.currentlyDoing || "");
  const [specialty, setSpecialty] = useState(profile.specialty || "");
  const [themeSongUrl, setThemeSongUrl] = useState(profile.themeSongUrl || "");
  const [themeSongLabel, setThemeSongLabel] = useState(profile.themeSongLabel || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: bio || null,
          profileColor: selectedColor,
          mood: mood || null,
          currentlyDoing: currentlyDoing || null,
          specialty: specialty || null,
          themeSongUrl: themeSongUrl || null,
          themeSongLabel: themeSongLabel || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated!");
        onUpdate({
          bio,
          profileColor: selectedColor,
          mood,
          currentlyDoing,
          specialty,
          themeSongUrl,
          themeSongLabel,
        });
      } else {
        setMessage(data.error || "Failed to update profile");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-display font-black text-[18px] text-[var(--text)] mb-6">
        Customize Your Profile
      </h2>

      <div className="space-y-6">
        {/* Profile Color */}
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Profile Color
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLOWED_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[var(--bg)]" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Bio (max 280 chars)
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 280))}
            placeholder="Tell the watchdogs about yourself..."
            className="input resize-none"
            rows={3}
          />
          <div className="text-right text-xs text-[var(--text-muted)] mt-1">
            {bio.length}/280
          </div>
        </div>

        {/* Mood */}
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Current Mood
          </label>
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value.slice(0, 60))}
            placeholder="e.g., caffeinated, vengeful, amused..."
            className="input"
          />
        </div>

        {/* Currently Doing */}
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Currently Doing
          </label>
          <input
            type="text"
            value={currentlyDoing}
            onChange={(e) => setCurrentlyDoing(e.target.value.slice(0, 60))}
            placeholder="e.g., hunting rugs, auditing contracts..."
            className="input"
          />
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Specialty
          </label>
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value.slice(0, 60))}
            placeholder="e.g., honeypot detection, wallet tracing..."
            className="input"
          />
        </div>

        {/* Theme Song */}
        <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-lg">
          <h3 className="font-bold text-[var(--text)] mb-3">
            {"\u{1F3B5}"} Theme Song (MySpace style)
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">
                Song URL (YouTube, Spotify, etc.)
              </label>
              <input
                type="url"
                value={themeSongUrl}
                onChange={(e) => setThemeSongUrl(e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-muted)] mb-1">
                Song Label
              </label>
              <input
                type="text"
                value={themeSongLabel}
                onChange={(e) => setThemeSongLabel(e.target.value.slice(0, 100))}
                placeholder="Artist - Song Name"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className={`text-sm ${message.includes("error") || message.includes("Failed") ? "text-[var(--red)]" : "text-[var(--green)]"}`}>
            {message}
          </p>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
