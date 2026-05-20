"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ShameMessage from "@/components/ShameMessage";

export default function MyProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      router.push(`/profile/${session.user.name}`);
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">&#x2620;</div>
        <p className="text-[var(--foreground-muted)] mb-4">Loading your profile...</p>
        <ShameMessage />
      </div>
    </div>
  );
}
