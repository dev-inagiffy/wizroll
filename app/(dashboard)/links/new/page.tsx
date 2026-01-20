import { AppHeader } from "@/components/layout/app-header";
import { LinkForm } from "@/components/public-links/link-form";

export default function NewLinkPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: "Public Links", href: "/links" },
          { label: "New" },
        ]}
      />
      <div className="flex-1 p-4">
        <div className="max-w-xl">
          <LinkForm />
        </div>
      </div>
    </>
  );
}
