import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { CommunityList } from "@/components/communities/community-list";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities",
  description: "Manage your WhatsApp communities and their invite links.",
};

export default function CommunitiesPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "Communities" }]}
        actions={
          <Button asChild>
            <Link href="/communities/new">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="mr-2" />
              New Community
            </Link>
          </Button>
        }
      />
      <div className="flex-1 p-4">
        <CommunityList />
      </div>
    </>
  );
}
