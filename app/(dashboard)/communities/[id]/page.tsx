import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CommunityEditContent } from "./community-edit-content";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityEditPage({ params }: Props) {
  const { id } = await params;

  const preloadedCommunity = await preloadAuthQuery(api.communities.get, {
    id: id as Id<"communities">,
  });

  // The actual null check happens in the client component
  // since we can't access the resolved value here

  return (
    <CommunityEditContent
      communityId={id as Id<"communities">}
      preloadedCommunity={preloadedCommunity}
    />
  );
}
