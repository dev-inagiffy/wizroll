import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Public query - no authentication required
export const getPublicJoinPage = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      found: v.literal(true),
      communityName: v.string(),
      communityDescription: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      isActive: v.boolean(),
      hasAvailableLinks: v.boolean(),
      totalMembers: v.number(),
    }),
    v.object({
      found: v.literal(false),
    })
  ),
  handler: async (ctx, args) => {
    // Find the public join link by slug
    const publicLink = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (!publicLink) {
      return { found: false as const };
    }

    if (!publicLink.isActive || !publicLink.activeCommunityId) {
      return { found: false as const };
    }

    // Get the active community
    const community = await ctx.db.get(publicLink.activeCommunityId);
    if (!community || !community.isActive) {
      return { found: false as const };
    }

    // Get all community links to check availability and count members
    const communityLinks = await ctx.db
      .query("communityLinks")
      .withIndex("by_community", (q) =>
        q.eq("communityId", publicLink.activeCommunityId!)
      )
      .collect();

    const hasAvailableLinks = communityLinks.some((link) => !link.isExhausted);

    // Calculate total members across all links
    const totalMembers = communityLinks.reduce(
      (sum, link) => sum + link.memberCount,
      0
    );

    // Resolve logo URL (handle invalid storage IDs gracefully)
    let logoUrl: string | null = null;
    if (community.logoStorageId) {
      try {
        logoUrl = await ctx.storage.getUrl(community.logoStorageId);
      } catch {
        // Storage ID invalid, ignore
      }
    }

    return {
      found: true as const,
      communityName: community.name,
      communityDescription: community.description,
      logoUrl: logoUrl ?? undefined,
      isActive: true,
      hasAvailableLinks,
      totalMembers,
    };
  },
});

// Public mutation - no authentication required
// This handles the rollover logic
export const recordJoin = mutation({
  args: {
    slug: v.string(),
    ipHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  returns: v.union(
    v.object({
      success: v.literal(true),
      whatsappUrl: v.string(),
    }),
    v.object({
      success: v.literal(false),
      error: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // 1. Find public link by slug
    const publicLink = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (!publicLink) {
      return { success: false as const, error: "Link not found" };
    }

    if (!publicLink.isActive) {
      return { success: false as const, error: "Link is not active" };
    }

    if (!publicLink.activeCommunityId) {
      return { success: false as const, error: "No community assigned" };
    }

    // 2. Get active community
    const community = await ctx.db.get(publicLink.activeCommunityId);
    if (!community || !community.isActive) {
      return { success: false as const, error: "Community not available" };
    }

    // 3. Find first non-exhausted link (by priority order)
    const communityLinks = await ctx.db
      .query("communityLinks")
      .withIndex("by_community_priority", (q) =>
        q.eq("communityId", publicLink.activeCommunityId!)
      )
      .order("asc")
      .collect();

    // Filter to non-exhausted links that still have capacity
    const availableLinks = communityLinks.filter(
      (link) => !link.isExhausted && link.memberCount < link.maxMembers
    );

    if (availableLinks.length === 0) {
      return {
        success: false as const,
        error: "All invite links are full or exhausted",
      };
    }

    // Get the first available link
    const activeLink = availableLinks[0];

    // 4. Increment memberCount on the link
    const newMemberCount = activeLink.memberCount + 1;
    await ctx.db.patch(activeLink._id, { memberCount: newMemberCount });

    // 5. Mark as exhausted if now at capacity
    if (newMemberCount >= activeLink.maxMembers) {
      await ctx.db.patch(activeLink._id, { isExhausted: true });
    }

    // 6. Log JoinEvent
    await ctx.db.insert("joinEvents", {
      publicJoinLinkId: publicLink._id,
      communityId: community._id,
      communityLinkId: activeLink._id,
      timestamp: Date.now(),
      ipHash: args.ipHash,
      userAgent: args.userAgent,
    });

    // 7. Return WhatsApp URL
    return {
      success: true as const,
      whatsappUrl: activeLink.whatsappInviteUrl,
    };
  },
});
