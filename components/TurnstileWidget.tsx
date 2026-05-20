"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

const TURNSTILE_SITE_KEY = "0x4AAAAAADS3qFBQQaCV3kc4";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (error: unknown) => void;
          theme?: "light" | "dark";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function TurnstileWidget({
  onVerify,
  onExpire,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenReceivedRef = useRef(false);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          if (tokenReceivedRef.current) return;
          tokenReceivedRef.current = true;
          setError(null);
          onVerifyRef.current(token);
        },
        "expired-callback": () => {
          tokenReceivedRef.current = false;
          onExpireRef.current?.();
        },
        "error-callback": () => {
          setError("Verification failed");
        },
        theme: "dark",
      });
      setLoading(false);
    } catch {
      setError("Failed to render widget");
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    tokenReceivedRef.current = false;

    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      setLoading(false);
    } else {
      widgetIdRef.current = null;
      renderWidget();
    }
  }, [renderWidget]);

  useEffect(() => {
    if (window.turnstile) {
      renderWidget();
      return;
    }

    const existingScript = document.querySelector(
      "script[src*=\"challenges.cloudflare.com/turnstile\"]"
    );

    if (existingScript) {
      window.onTurnstileLoad = renderWidget;
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;

    script.onerror = () => {
      setError("Failed to load verification");
      setLoading(false);
    };

    window.onTurnstileLoad = renderWidget;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center my-4 p-4 border border-red-500/50 rounded">
        <p className="text-red-400 text-sm mb-2">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="text-sm text-[var(--green-primary)] hover:underline"
        >
          Click to retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center my-4">
      {loading && (
        <p className="text-[var(--foreground-muted)] text-sm mb-2">
          Loading verification...
        </p>
      )}
      <div ref={containerRef} />
    </div>
  );
}
