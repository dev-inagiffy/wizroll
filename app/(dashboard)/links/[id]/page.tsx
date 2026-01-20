import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LinkEditContent } from "./link-edit-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LinkEditPage({ params }: Props) {
  const { id } = await params;

  const preloadedLink = await preloadAuthQuery(api.publicJoinLinks.get, {
    id: id as Id<"publicJoinLinks">,
  });

  return <LinkEditContent preloadedLink={preloadedLink} />;
}
