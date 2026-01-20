import { AppHeader } from "@/components/layout/app-header";
import { CommunityForm } from "@/components/communities/community-form";

export default function NewCommunityPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Communities", href: "/communities" },
          { label: "New" },
        ]}
      />
      <div className="flex-1 p-4">
        <div className="max-w-xl">
          <CommunityForm />
        </div>
      </div>
    </>
  );
}
