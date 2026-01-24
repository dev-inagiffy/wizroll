import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function getPublicJoinPageData(slug: string) {
  try {
    return await fetchQuery(api.publicApi.getPublicJoinPage, { slug });
  } catch (error) {
    console.error("Error fetching public join page data:", error);
    return { found: false as const };
  }
}
