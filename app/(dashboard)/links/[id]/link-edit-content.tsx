"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";
import { Preloaded } from "convex/react";
import { AppHeader } from "@/components/layout/app-header";
import { LinkForm } from "@/components/public-links/link-form";
import { notFound } from "next/navigation";

interface LinkEditContentProps {
  preloadedLink: Preloaded<typeof api.publicJoinLinks.get>;
}

export function LinkEditContent({ preloadedLink }: LinkEditContentProps) {
  const link = usePreloadedAuthQuery(preloadedLink);

  if (!link) {
    notFound();
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Public Links", href: "/links" },
          { label: `/j/${link.slug}` },
        ]}
      />
      <div className="flex-1 p-4">
        <div className="max-w-xl">
          <LinkForm link={link} />
        </div>
      </div>
    </>
  );
}
