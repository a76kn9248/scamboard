"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import XPBar from "@/components/XPBar";
import ColorPicker from "@/components/ColorPicker";
import ShameMessage from "@/components/ShameMessage";

interface UserProfile {
  nickname: string;
  bio: string | null;
  profileColor: string | null;
  title: string | null;
  xp: number;
  nextTitleProgress: {
    nextTitle: string;
    xpNeeded: number;
    progress: number;
  } | null;
  createdAt: string;
  stats: {
    reports: number;
    confirms: number;
    comments: number;
    roasts: number;
    roastWins: number;
  };
  recentActivity: {
    reports: Array<{
      type: string;
      reportId: string;
      identifier: string;
      reportType: string;
      createdAt: string;
    }>;
    confirms: Array<{
      type: string;
      reportId: string;
      identifier: string;
      reportType: string;
      createdAt: string;
    }>;
    comments: Array<{
      type: string;
      reportId: string;
      identifier: string;
      preview: string;
      createdAt: string;
    }>;
  };
}

export default function UserProfileClient({ nickname }: { nickname: string }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editColor, setEditColor] = useState("#ff1744");
  const [saving, setSaving] = useState(false);

  const isOwnProfile = session?.user?.name === nickname;

  useEffect(() => {
    fetch(`/api/users/${nickname}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setProfile(null);
        } else {
          setProfile(data);
          setEditBio(data.bio || "");
          setEditColor(data.profileColor || "#ff1744");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nickname]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: editBio, profileColor: editColor }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                bio: data.user.bio,
                profileColor: data.user.profileColor,
              }
            : null
        );
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="skeleton h-64 rounded-lg mb-6" />
          <div className="skeleton h-32 rounded-lg mb-6" />
          <div className="skeleton h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-6xl mb-4 block">&#x1F47B;</span>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">User Not Found</h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            This watchdog doesn&apos;t exist. Maybe they got rugged too?
          </p>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const profileColor = profile.profileColor || "#ff1744";

  // Merge all activity and sort by date
  const allActivity = [
    ...profile.recentActivity.reports,
    ...profile.recentActivity.confirms,
    ...profile.recentActivity.comments,
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div
          className="card p-6 mb-6"
          style={{ borderColor: profileColor, borderWidth: "2px" }}
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0"
              style={{
                backgroundColor: `${profileColor}33`,
                color: profileColor,
              }}
            >
              {nickname.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                  @{profile.nickname}
                </h1>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${profileColor}22`,
                    color: profileColor,
                    border: `1px solid ${profileColor}44`,
                  }}
                >
                  {profile.title}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--foreground-muted)] mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value.slice(0, 280))}
                      className="input"
                      rows={3}
                      maxLength={280}
                      placeholder="Tell us about yourself..."
                    />
                    <span className="text-xs text-[var(--foreground-dimmed)]">
                      {editBio.length}/280
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                      Profile Color
                    </label>
                    <ColorPicker
                      selectedColor={editColor}
                      onChange={setEditColor}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditBio(profile.bio || "");
                        setEditColor(profile.profileColor || "#ff1744");
                      }}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {profile.bio && (
                    <p className="text-[var(--foreground-muted)] mb-4">
                      {profile.bio}
                    </p>
                  )}

                  <div className="mb-4">
                    <XPBar xp={profile.xp} title={profile.title || "Fresh Degen"} />
                  </div>

                  <p className="text-sm text-[var(--foreground-dimmed)]">
                    Joined {formatDistanceToNow(new Date(profile.createdAt))}
                  </p>

                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary text-sm py-2 px-4 mt-4"
                    >
                      Edit Profile
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-[var(--background-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--red-primary)]">
                {profile.stats.reports}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Reports</div>
            </div>
            <div className="text-center p-3 bg-[var(--background-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--orange-primary)]">
                {profile.stats.confirms}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Confirms</div>
            </div>
            <div className="text-center p-3 bg-[var(--background-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--green-primary)]">
                {profile.stats.comments}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Comments</div>
            </div>
            <div className="text-center p-3 bg-[var(--background-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--purple-primary)]">
                {profile.stats.roasts}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Roasts</div>
            </div>
            <div className="text-center p-3 bg-[var(--background-tertiary)] rounded-lg">
              <div className="text-2xl font-bold text-[var(--gold-primary)]">
                {profile.stats.roastWins}
              </div>
              <div className="text-xs text-[var(--foreground-muted)]">Roast Wins</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
            Recent Activity
          </h2>

          {allActivity.length === 0 ? (
            <p className="text-[var(--foreground-muted)] text-center py-8">
              No activity yet. Time to start hunting scammers!
            </p>
          ) : (
            <div className="space-y-3">
              {allActivity.slice(0, 15).map((activity, index) => (
                <Link
                  key={`${activity.type}-${index}`}
                  href={`/report/${activity.reportId}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background-card)] transition-colors"
                >
                  <span className="text-lg">
                    {activity.type === "report"
                      ? "\u{1F6A9}"
                      : activity.type === "confirm"
                      ? "\u{2705}"
                      : "\u{1F4AC}"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)]">
                      {activity.type === "report" && (
                        <>
                          Reported{" "}
                          <span className="text-[var(--red-primary)]">
                            {"identifier" in activity && (activity as { reportType: string }).reportType === "twitter"
                              ? "@"
                              : ""}
                            {("identifier" in activity ? (activity as { identifier: string }).identifier : "").slice(0, 12)}
                            {("identifier" in activity ? (activity as { identifier: string }).identifier.length : 0) > 12 ? "..." : ""}
                          </span>
                        </>
                      )}
                      {activity.type === "confirm" && (
                        <>
                          Confirmed{" "}
                          <span className="text-[var(--orange-primary)]">
                            {"identifier" in activity && (activity as { reportType: string }).reportType === "twitter"
                              ? "@"
                              : ""}
                            {("identifier" in activity ? (activity as { identifier: string }).identifier : "").slice(0, 12)}
                            {("identifier" in activity ? (activity as { identifier: string }).identifier.length : 0) > 12 ? "..." : ""}
                          </span>
                        </>
                      )}
                      {activity.type === "comment" && (
                        <>
                          Commented:{" "}
                          <span className="text-[var(--foreground-muted)]">
                            &ldquo;{"preview" in activity ? (activity as { preview: string }).preview : ""}...&rdquo;
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--foreground-dimmed)]">
                    {formatDistanceToNow(new Date(activity.createdAt))}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Shame message */}
        <div className="text-center mt-8">
          <ShameMessage />
        </div>
      </div>
    </div>
  );
}
