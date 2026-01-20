import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { DashboardContent } from "./dashboard-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your WhatsApp community stats and manage your links.",
};

const Page = async () => {
  const [preloadedUserQuery, preloadedStats, preloadedCommunities, preloadedPublicLinks] = await Promise.all([
    preloadAuthQuery(api.auth.getCurrentUser),
    preloadAuthQuery(api.joinEvents.getStats),
    preloadAuthQuery(api.communities.list),
    preloadAuthQuery(api.publicJoinLinks.list),
  ]);

  return (
    <DashboardContent
      preloadedUserQuery={preloadedUserQuery}
      preloadedStats={preloadedStats}
      preloadedCommunities={preloadedCommunities}
      preloadedPublicLinks={preloadedPublicLinks}
    />
  );
};

export default Page;
