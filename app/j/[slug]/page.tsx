import { JoinPage } from "@/components/public-join/join-page";
import { getPublicJoinPageData } from "@/lib/convex-server";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicJoinPage({ params }: Props) {
  const { slug } = await params;

  return <JoinPage slug={slug} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicJoinPageData(slug);

  if (!data.found) {
    return {
      title: "Community Not Found - This link is no longer active | Wizroll",
      description:
        "This WhatsApp community link doesn't exist or has been deactivated. The community may have been removed or the link has expired.",
    };
  }

  // Create descriptive title (optimal: 50-60 chars)
  const title = `Join ${data.communityName} on WhatsApp - ${data.totalMembers}+ Members | Wizroll`;

  // Create descriptive description (optimal: 110-160 chars)
  const description =
    data.communityDescription && data.communityDescription.length > 80
      ? data.communityDescription
      : `Join the ${data.communityName} WhatsApp community today! Connect with ${data.totalMembers}+ members.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Wizroll",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/j/${slug}`,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/j/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `Join ${data.communityName} on WhatsApp - ${data.totalMembers}+ Members | Wizroll`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL}/j/${slug}/twitter-image`],
    },
  };
}
