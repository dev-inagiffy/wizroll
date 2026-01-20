import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { SettingsContent } from "./settings-content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and subscription.",
};

interface SettingsPageProps {
  searchParams: Promise<{ upgraded?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const [preloadedUserQuery, preloadedSubscription] = await Promise.all([
    preloadAuthQuery(api.auth.getCurrentUser),
    preloadAuthQuery(api.subscriptions.getSubscription),
  ]);

  return (
    <SettingsContent
      preloadedUserQuery={preloadedUserQuery}
      preloadedSubscription={preloadedSubscription}
      showUpgradeSuccess={params.upgraded === "true"}
    />
  );
}
