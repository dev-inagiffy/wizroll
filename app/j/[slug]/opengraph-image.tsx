import { ImageResponse } from "next/og";
import { getPublicJoinPageData } from "@/lib/convex-server";

export const runtime = "edge";
export const alt = "Join WhatsApp Community";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Design system colors (oklch converted to hex for Satori compatibility)
const colors = {
  background: "#171717",
  primary: "#22c55e",
  foreground: "#fafafa",
  muted: "#a3a3a3",
};

// Get the site URL with fallback
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://wizroll.vercel.app";

// WhatsApp icon as inline SVG path
const WhatsAppSvg = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    style={{ marginRight: 12 }}
  >
    <path
      d="M12.001 2C6.478 2 2 6.478 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012.001 22C17.523 22 22 17.522 22 12S17.523 2 12.001 2zm0 18c-1.657 0-3.216-.508-4.5-1.375l-.324-.195-2.876.855.855-2.876-.195-.324A7.955 7.955 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.588 8-7.999 8zm4.604-5.924c-.252-.126-1.49-.735-1.721-.82-.231-.083-.4-.126-.568.126-.168.252-.651.82-.798.988-.147.168-.295.189-.547.063-.252-.126-1.063-.392-2.024-1.249-.748-.667-1.253-1.49-1.4-1.742-.147-.252-.016-.389.111-.514.113-.113.252-.294.378-.441.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.568-1.369-.778-1.875-.205-.49-.413-.424-.568-.432-.147-.008-.315-.01-.483-.01-.168 0-.441.063-.672.315-.231.252-.883.863-.883 2.104 0 1.241.904 2.44 1.03 2.608.126.168 1.779 2.715 4.31 3.805.602.26 1.072.415 1.438.531.604.192 1.154.165 1.59.1.485-.072 1.49-.609 1.7-1.197.21-.588.21-1.092.147-1.197-.063-.105-.231-.168-.483-.294z"
      fill="#25D366"
    />
  </svg>
);

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicJoinPageData(slug);

  if (!data.found) {
    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: colors.foreground,
            marginBottom: 20,
          }}
        >
          Community Not Found
        </span>
        <span
          style={{
            fontSize: 32,
            color: colors.muted,
          }}
        >
          Wizroll
        </span>
      </div>,
      { ...size },
    );
  }

  const { communityName, communityDescription, logoUrl, totalMembers } = data;

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        padding: 60,
      }}
    >
      {/* Community Logo - Centered and Large */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: colors.primary,
          marginBottom: 40,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
        }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt=""
            width={200}
            height={200}
            style={{
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ color: "white", fontSize: 96, fontWeight: 700 }}>
            {communityName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Community Name - Large and Centered */}
      <span
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: colors.foreground,
          marginBottom: 16,
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {communityName.length > 24
          ? communityName.substring(0, 24) + "..."
          : communityName}
      </span>

      {/* Member count and WhatsApp badge */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <WhatsAppSvg />
        <span
          style={{
            fontSize: 32,
            color: colors.muted,
          }}
        >
          {totalMembers}+ members
        </span>
      </div>

      {/* CTA Button - Large */}
      <div
        style={{
          display: "flex",
          backgroundColor: colors.primary,
          color: "white",
          padding: "24px 64px",
          borderRadius: 16,
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        <span>Click to Join</span>
      </div>

      {/* Bottom branding */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
          bottom: 30,
          right: 40,
        }}
      >
        <img
          src={`${siteUrl}/logo.png`}
          width={32}
          height={32}
          style={{
            marginRight: 10,
          }}
        />
        <span
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: colors.muted,
          }}
        >
          Wizroll
        </span>
      </div>
    </div>,
    { ...size },
  );
}
