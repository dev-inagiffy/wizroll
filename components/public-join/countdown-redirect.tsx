"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CountdownRedirectProps {
  slug: string;
  platform?: "ios" | "android" | "other";
  countdownSeconds?: number;
}

export function CountdownRedirect({
  slug,
  platform = "other",
  countdownSeconds = 5,
}: CountdownRedirectProps) {
  const recordJoin = useMutation(api.publicApi.recordJoin);
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasTriggeredRef = useRef(false);

  const handleRedirect = async () => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;
    setIsRedirecting(true);
    setError(null);

    try {
      const result = await recordJoin({
        slug,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });

      if (result.success) {
        // Redirect to WhatsApp
        window.location.href = result.whatsappUrl;
      } else {
        setError(result.error);
        setIsRedirecting(false);
        hasTriggeredRef.current = false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsRedirecting(false);
      hasTriggeredRef.current = false;
    }
  };

  const handleCancel = () => {
    setIsCancelled(true);
  };

  // Countdown effect - only runs if not cancelled
  useEffect(() => {
    if (isCancelled) return;

    if (countdown <= 0) {
      const redirectTimer = setTimeout(() => {
        handleRedirect();
      }, 0);
      return () => clearTimeout(redirectTimer);
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, isCancelled]);

  // Platform-specific button styles
  const buttonStyles =
    platform === "ios"
      ? "rounded-[14px] h-[50px] text-[17px] font-semibold tracking-tight active:opacity-70"
      : "rounded-lg h-12 text-base font-medium active:scale-[0.98]";

  return (
    <div className="space-y-3">
      {error && (
        <div
          className={`p-3 bg-destructive/10 text-destructive text-sm text-center ${
            platform === "ios" ? "rounded-xl" : "rounded-lg"
          }`}
        >
          {error}
        </div>
      )}

      {/* Countdown display - only show if not cancelled */}
      {!isCancelled && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {isRedirecting ? (
              "Opening WhatsApp..."
            ) : (
              <>
                Redirecting in{" "}
                <span className="font-bold text-primary text-lg tabular-nums">
                  {countdown}
                </span>{" "}
                seconds
              </>
            )}
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${((countdownSeconds - countdown) / countdownSeconds) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Cancelled state message */}
      {isCancelled && !isRedirecting && (
        <p className="text-sm text-muted-foreground text-center">
          Auto-redirect cancelled. Click below to join manually.
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Cancel button - only show if countdown is active */}
        {!isCancelled && !isRedirecting && (
          <button
            onClick={handleCancel}
            className={`
              flex-1 bg-muted hover:bg-muted/80 text-muted-foreground
              flex items-center justify-center
              transition-all duration-150 ease-out
              ${platform === "ios" ? "rounded-[14px] h-[50px] text-[17px] font-semibold" : "rounded-lg h-12 text-base font-medium"}
            `}
          >
            Cancel
          </button>
        )}

        {/* Join button */}
        <button
          onClick={handleRedirect}
          disabled={isRedirecting}
          className={`
            ${isCancelled || isRedirecting ? "w-full" : "flex-1"}
            bg-primary hover:bg-primary/90 text-primary-foreground
            flex items-center justify-center gap-2
            transition-all duration-150 ease-out
            disabled:opacity-60 disabled:cursor-not-allowed
            ${buttonStyles}
          `}
        >
          {isRedirecting ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Opening WhatsApp...</span>
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Join Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
