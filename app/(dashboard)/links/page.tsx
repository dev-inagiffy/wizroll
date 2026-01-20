import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { LinkList } from "@/components/public-links/link-list";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Links",
  description: "Manage your public join links with automatic rollover.",
};

export default function LinksPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "Public Links" }]}
        actions={
          <Button asChild>
            <Link href="/links/new">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="mr-2" />
              New Link
            </Link>
          </Button>
        }
      />
      <div className="flex-1 p-4">
        <LinkList />
      </div>
    </>
  );
}
