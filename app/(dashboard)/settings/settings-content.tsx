"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";
import { Preloaded, useMutation } from "convex/react";
import { AppHeader } from "@/components/layout/app-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun,
  Moon,
  ComputerIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { authClient } from "@/lib/auth-client";
import { parseConvexError } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface SettingsContentProps {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
  preloadedSubscription: Preloaded<typeof api.subscriptions.getSubscription>;
  showUpgradeSuccess?: boolean;
}

export function SettingsContent({
  preloadedUserQuery,
  preloadedSubscription,
  showUpgradeSuccess,
}: SettingsContentProps) {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  const subscription = usePreloadedAuthQuery(preloadedSubscription);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(showUpgradeSuccess);
  const linkSubscription = useMutation(api.subscriptions.linkSubscription);
  const hasLinked = useRef(false);

  // Auto-link subscription if found by email
  useEffect(() => {
    if (subscription?.needsLink && !hasLinked.current) {
      hasLinked.current = true;
      linkSubscription().catch(console.error);
    }
  }, [subscription?.needsLink, linkSubscription]);

  // Hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const isPro =
    subscription?.plan === "pro" && subscription?.status === "active";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.email) {
      setUpgradeError("Please ensure you have an email set on your account.");
      return;
    }

    setIsUpgrading(true);
    setUpgradeError(null);
    try {
      await authClient.dodopayments.checkout({
        slug: "pro-plan",
        customer: {
          email: user.email,
          name: user.name || user.email,
        },
        billing: {
          city: "Not provided",
          country: "US",
          state: "NA",
          street: "Not provided",
          zipcode: "00000",
        },
      });
    } catch (error) {
      setUpgradeError(parseConvexError(error));
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <>
      <AppHeader breadcrumbs={[{ label: "Settings" }]} />
      <div className="flex-1 p-4 space-y-4">
        {showSuccess && (
          <div className="max-w-xl rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                strokeWidth={2}
                className="size-5 text-green-600"
              />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Payment successful!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Your subscription is being activated. It may take a moment to reflect.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-xl space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription className="text-xs">
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="grid gap-0.5">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-sm font-medium">{user?.name || "Not set"}</p>
              </div>
              <div className="grid gap-0.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">
                  {user?.email || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription className="text-xs">
                Customize how Wizroll looks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <Label className="text-xs">Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="flex-1 h-8 text-xs"
                    size="sm"
                  >
                    <HugeiconsIcon
                      icon={Sun}
                      strokeWidth={2}
                      className="mr-1.5 size-3.5"
                    />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="flex-1 h-8 text-xs"
                    size="sm"
                  >
                    <HugeiconsIcon
                      icon={Moon}
                      strokeWidth={2}
                      className="mr-1.5 size-3.5"
                    />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="flex-1 h-8 text-xs"
                    size="sm"
                  >
                    <HugeiconsIcon
                      icon={ComputerIcon}
                      strokeWidth={2}
                      className="mr-1.5 size-3.5"
                    />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Subscription</CardTitle>
              <CardDescription className="text-xs">
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="grid gap-0.5">
                <Label className="text-xs text-muted-foreground">
                  Current Plan
                </Label>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {isPro ? "Pro" : "Free"}
                  </p>
                  {isPro && (
                    <Badge
                      variant="default"
                      className="text-[10px] px-1.5 py-0"
                    >
                      Active
                    </Badge>
                  )}
                </div>
              </div>
              {upgradeError && (
                <div className="rounded bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                  {upgradeError}
                </div>
              )}
              {isPro ? (
                <div className="rounded border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      strokeWidth={2}
                      className="size-4 text-green-600 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Pro Plan Active
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        Unlimited communities and public links
                      </p>
                      {subscription?.currentPeriodEnd && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Renews on{" "}
                          {new Date(
                            subscription.currentPeriodEnd,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded border p-3 space-y-2">
                  <div>
                    <p className="text-sm font-medium">Upgrade to Pro</p>
                    <p className="text-xs text-muted-foreground">
                      Unlimited communities and public links
                    </p>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    size="sm"
                    className="h-8"
                  >
                    {isUpgrading ? "Loading..." : "Upgrade Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Danger Zone</CardTitle>
              <CardDescription className="text-xs">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
                size="sm"
                className="h-8"
              >
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
