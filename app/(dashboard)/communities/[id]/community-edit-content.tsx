"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";
import { Preloaded } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { AppHeader } from "@/components/layout/app-header";
import { CommunityForm } from "@/components/communities/community-form";
import { LinksManager } from "@/components/communities/links-manager";
import { notFound } from "next/navigation";

interface CommunityEditContentProps {
  communityId: Id<"communities">;
  preloadedCommunity: Preloaded<typeof api.communities.get>;
}

export function CommunityEditContent({
  communityId,
  preloadedCommunity,
}: CommunityEditContentProps) {
  const community = usePreloadedAuthQuery(preloadedCommunity);

  if (!community) {
    notFound();
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Communities", href: "/communities" },
          { label: community.name },
        ]}
      />
      <div className="flex-1 p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <CommunityForm community={community} />
          <LinksManager communityId={communityId} />
        </div>
      </div>
    </>
  );
}
