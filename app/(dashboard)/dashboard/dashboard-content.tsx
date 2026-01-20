"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";
import { Preloaded } from "convex/react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Link01Icon,
  ArrowUp01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
  preloadedStats: Preloaded<typeof api.joinEvents.getStats>;
  preloadedCommunities: Preloaded<typeof api.communities.list>;
  preloadedPublicLinks: Preloaded<typeof api.publicJoinLinks.list>;
}

export function DashboardContent({
  preloadedUserQuery,
  preloadedStats,
  preloadedCommunities,
  preloadedPublicLinks,
}: DashboardContentProps) {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  const stats = usePreloadedAuthQuery(preloadedStats);
  const communities = usePreloadedAuthQuery(preloadedCommunities);
  const publicLinks = usePreloadedAuthQuery(preloadedPublicLinks);

  const safeStats = stats ?? {
    totalJoins: 0,
    joinsToday: 0,
    joinsThisWeek: 0,
    joinsThisMonth: 0,
    joinsByDay: [],
  };
  const safeCommunities = communities ?? [];
  const safePublicLinks = publicLinks ?? [];

  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Dashboard" }]} />
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h1 className="text-xl font-semibold">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of your WhatsApp community links
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Joins</CardTitle>
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                strokeWidth={2}
                className="size-3.5 text-muted-foreground"
              />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xl font-bold">{safeStats.totalJoins}</div>
              <p className="text-[11px] text-muted-foreground">
                +{safeStats.joinsToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">This Week</CardTitle>
              <HugeiconsIcon
                icon={Calendar03Icon}
                strokeWidth={2}
                className="size-3.5 text-muted-foreground"
              />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xl font-bold">{safeStats.joinsThisWeek}</div>
              <p className="text-[11px] text-muted-foreground">
                {safeStats.joinsThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Communities</CardTitle>
              <HugeiconsIcon
                icon={UserGroupIcon}
                strokeWidth={2}
                className="size-3.5 text-muted-foreground"
              />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xl font-bold">{safeCommunities.length}</div>
              <p className="text-[11px] text-muted-foreground">
                {safeCommunities.filter((c) => c.isActive).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Public Links</CardTitle>
              <HugeiconsIcon
                icon={Link01Icon}
                strokeWidth={2}
                className="size-3.5 text-muted-foreground"
              />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xl font-bold">{safePublicLinks.length}</div>
              <p className="text-[11px] text-muted-foreground">
                {safePublicLinks.filter((l) => l.isActive).length} active
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Recent Communities</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {safeCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    No communities yet
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/communities/new">Create Community</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {safeCommunities.slice(0, 5).map((community) => (
                    <div
                      key={community._id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
                          <HugeiconsIcon
                            icon={UserGroupIcon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{community.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {community.currentMembers}/{community.maxMembers} members
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/communities/${community._id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Public Links</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {safePublicLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    No public links yet
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/links/new">Create Link</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {safePublicLinks.slice(0, 5).map((link) => (
                    <div
                      key={link._id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
                          <HugeiconsIcon
                            icon={Link01Icon}
                            strokeWidth={2}
                            className="size-3.5"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">/j/{link.slug}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {link.communityName || "No community assigned"}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/links/${link._id}`}>Edit</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
