"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CountdownRedirect } from "./countdown-redirect";
import Image from "next/image";
import { useState } from "react";

interface JoinPageProps {
  slug: string;
}

// Detect platform - computed once on mount
function usePlatform() {
  const [platform] = useState<"ios" | "android" | "other">(() => {
    if (typeof navigator === "undefined") return "other";
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    return "other";
  });

  return platform;
}

// Format member count to display in hundreds (100+, 200+, etc.)
function formatMemberCount(count: number): string {
  if (count < 100) {
    return `${count} members`;
  }
  if (count >= 1000) {
    return "1000+ members";
  }
  const hundreds = Math.floor(count / 100) * 100;
  return `${hundreds}+ members`;
}

// Collapsible description component
function CollapsibleDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const charLimit = 120;
  const shouldTruncate = description.length > charLimit;

  const displayText = shouldTruncate && !isExpanded
    ? description.substring(0, charLimit).trim() + "..."
    : description;

  return (
    <div className="text-center mb-3 max-w-xs">
      <p className="text-[14px] text-muted-foreground whitespace-pre-line">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[13px] text-primary font-medium mt-1 hover:underline"
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export function JoinPage({ slug }: JoinPageProps) {
  const pageData = useQuery(api.publicApi.getPublicJoinPage, { slug });
  const platform = usePlatform();

  // Loading state
  if (!pageData) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-muted mb-6" />
          <div className="h-6 w-40 bg-muted rounded mb-3" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Not found state
  if (!pageData.found) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center px-6 bg-background">
        <div className="text-center">
          <div className="h-20 w-20 mx-auto mb-5 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2 text-foreground">
            Link Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            This join link doesn&apos;t exist or has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  const { communityName, communityDescription, logoUrl, hasAvailableLinks, totalMembers } = pageData;

  return (
    <div className="min-h-svh flex flex-col bg-background">
      {/* Main content area - takes remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Icon */}
        <div className="mb-5">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={communityName}
              width={96}
              height={96}
              className="rounded-full object-cover size-24 shadow-lg ring-4 ring-primary/20"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-primary-foreground">
                {communityName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Community name */}
        <h1 className="text-[22px] font-semibold text-center mb-2 text-foreground tracking-tight">
          {communityName}
        </h1>

        {/* Description with Read more/less */}
        {communityDescription && (
          <CollapsibleDescription description={communityDescription} />
        )}

        {/* Member count */}
        <p className="text-[13px] text-muted-foreground mb-0.5">
          {formatMemberCount(totalMembers)}
        </p>

        {/* Subtitle with WhatsApp icon */}
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12.001 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2z"
              fill="#25D366"
            />
            <path
              d="M12.001 20c-1.657 0-3.216-.508-4.5-1.375l-.324-.195-2.876.855.855-2.876-.195-.324A7.955 7.955 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.588 8-7.999 8zm4.604-5.924c-.252-.126-1.49-.735-1.721-.82-.231-.083-.4-.126-.568.126-.168.252-.651.82-.798.988-.147.168-.295.189-.547.063-.252-.126-1.063-.392-2.024-1.249-.748-.667-1.253-1.49-1.4-1.742-.147-.252-.016-.389.111-.514.113-.113.252-.294.378-.441.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.568-1.369-.778-1.875-.205-.49-.413-.424-.568-.432-.147-.008-.315-.01-.483-.01-.168 0-.441.063-.672.315-.231.252-.883.863-.883 2.104 0 1.241.904 2.44 1.03 2.608.126.168 1.779 2.715 4.31 3.805.602.26 1.072.415 1.438.531.604.192 1.154.165 1.59.1.485-.072 1.49-.609 1.7-1.197.21-.588.21-1.092.147-1.197-.063-.105-.231-.168-.483-.294z"
              fill="white"
            />
          </svg>
          <span>WhatsApp Community</span>
        </div>
      </div>

      {/* Bottom action area */}
      <div className="px-5 pb-8 pt-4 w-full max-w-md mx-auto">
        {hasAvailableLinks ? (
          <CountdownRedirect slug={slug} platform={platform} countdownSeconds={5} />
        ) : (
          <div
            className={`p-4 bg-destructive/10 border border-destructive/20 ${
              platform === "ios" ? "rounded-xl" : "rounded-lg"
            }`}
          >
            <p className="font-medium text-destructive text-center text-sm">
              Community is currently full
            </p>
            <p className="text-xs text-destructive/80 text-center mt-1">
              Please check back later
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-[11px] text-muted-foreground text-center mt-6">
          Powered by <span className="font-medium text-foreground">Wizroll</span>
        </p>
      </div>
    </div>
  );
}
