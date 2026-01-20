"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { JoinButton } from "./join-button";
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

export function JoinPage({ slug }: JoinPageProps) {
  const pageData = useQuery(api.publicApi.getPublicJoinPage, { slug });
  const platform = usePlatform();

  // WhatsApp-like font stack
  const fontStyle = {
    fontFamily:
      platform === "ios"
        ? '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif'
        : '"Roboto", "Google Sans", system-ui, sans-serif',
  };

  // Loading state
  if (!pageData) {
    return (
      <div
        className="min-h-svh flex flex-col items-center justify-center px-6 bg-[#F0F2F5] dark:bg-[#111B21]"
        style={fontStyle}
      >
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-[#D9DBE1] dark:bg-[#2A3942] mb-6" />
          <div className="h-6 w-40 bg-[#D9DBE1] dark:bg-[#2A3942] rounded mb-3" />
          <div className="h-4 w-24 bg-[#D9DBE1] dark:bg-[#2A3942] rounded" />
        </div>
      </div>
    );
  }

  // Not found state
  if (!pageData.found) {
    return (
      <div
        className="min-h-svh flex flex-col items-center justify-center px-6 bg-[#F0F2F5] dark:bg-[#111B21]"
        style={fontStyle}
      >
        <div className="text-center">
          <div className="h-20 w-20 mx-auto mb-5 rounded-full bg-[#D9DBE1] dark:bg-[#2A3942] flex items-center justify-center">
            <svg
              className="h-10 w-10 text-[#8696A0]"
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
          <h1 className="text-xl font-semibold mb-2 text-[#111B21] dark:text-[#E9EDEF]">
            Link Not Found
          </h1>
          <p className="text-sm text-[#667781] dark:text-[#8696A0]">
            This join link doesn&apos;t exist or has been deactivated.
          </p>
        </div>
      </div>
    );
  }

  const { communityName, logoUrl, hasAvailableLinks, totalMembers } = pageData;

  return (
    <div
      className="min-h-svh flex flex-col bg-[#F0F2F5] dark:bg-[#111B21]"
      style={fontStyle}
    >
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
              className="rounded-full object-cover size-24 shadow-lg ring-4 ring-white/50 dark:ring-black/20"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-[#00A884] flex items-center justify-center shadow-lg">
              <svg
                className="h-12 w-12 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
          )}
        </div>

        {/* Community name */}
        <h1 className="text-[22px] font-semibold text-center mb-1 text-[#111B21] dark:text-[#E9EDEF] tracking-tight">
          {communityName}
        </h1>

        {/* Member count */}
        <p className="text-[13px] text-[#667781] dark:text-[#8696A0] mb-0.5">
          {formatMemberCount(totalMembers)}
        </p>

        {/* Subtitle */}
        <p className="text-[13px] text-[#667781] dark:text-[#8696A0]">
          WhatsApp Community
        </p>
      </div>

      {/* Bottom action area */}
      <div className="px-5 pb-8 pt-4 w-full max-w-md mx-auto">
        {hasAvailableLinks ? (
          <JoinButton slug={slug} platform={platform} />
        ) : (
          <div
            className={`p-4 bg-[#FFF3CD] dark:bg-[#332701] border border-[#FFECB5] dark:border-[#665200] ${
              platform === "ios" ? "rounded-xl" : "rounded-lg"
            }`}
          >
            <p className="font-medium text-[#856404] dark:text-[#FFD60A] text-center text-sm">
              Community is currently full
            </p>
            <p className="text-xs text-[#856404]/80 dark:text-[#FFD60A]/70 text-center mt-1">
              Please check back later
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-[11px] text-[#8696A0] text-center mt-6">
          Powered by <span className="font-medium">Wizroll</span>
        </p>
      </div>
    </div>
  );
}
