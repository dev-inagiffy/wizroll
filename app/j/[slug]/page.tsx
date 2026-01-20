import { JoinPage } from "@/components/public-join/join-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicJoinPage({ params }: Props) {
  const { slug } = await params;

  return <JoinPage slug={slug} />;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  return {
    title: `Join Community - ${slug}`,
    description: "Join our WhatsApp community",
  };
}
