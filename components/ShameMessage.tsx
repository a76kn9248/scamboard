"use client";

import { useState, useEffect } from "react";
import { shameMessages } from "@/lib/shame-messages";

interface ShameMessageProps {
  interval?: number;
  className?: string;
}

export default function ShameMessage({
  interval = 5000,
  className = "",
}: ShameMessageProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % shameMessages.length);
        setIsVisible(true);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <p
      className={`text-sm text-[var(--foreground-muted)] italic transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {shameMessages[messageIndex]}
    </p>
  );
}
