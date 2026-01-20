import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { checkUserSubscription, PLAN_LIMITS } from "./subscriptions";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("publicJoinLinks"),
      _creationTime: v.number(),
      userId: v.string(),
      slug: v.string(),
      activeCommunityId: v.optional(v.id("communities")),
      isActive: v.boolean(),
      createdAt: v.number(),
      communityName: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    const links = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Enrich with community names
    const enrichedLinks = await Promise.all(
      links.map(async (link) => {
        let communityName: string | undefined;
        if (link.activeCommunityId) {
          const community = await ctx.db.get(link.activeCommunityId);
          communityName = community?.name;
        }
        return {
          ...link,
          communityName,
        };
      })
    );

    return enrichedLinks;
  },
});

export const get = query({
  args: { id: v.id("publicJoinLinks") },
  returns: v.union(
    v.object({
      _id: v.id("publicJoinLinks"),
      _creationTime: v.number(),
      userId: v.string(),
      slug: v.string(),
      activeCommunityId: v.optional(v.id("communities")),
      isActive: v.boolean(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return null;
    }

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== user._id) {
      return null;
    }

    return link;
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    activeCommunityId: v.optional(v.id("communities")),
  },
  returns: v.id("publicJoinLinks"),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check subscription status
    const { isPro, plan } = await checkUserSubscription(ctx, user._id);
    const limit = isPro ? PLAN_LIMITS.pro.publicLinks : PLAN_LIMITS.free.publicLinks;

    // Check plan limit
    const existingLinks = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (!isPro && existingLinks.length >= limit) {
      throw new Error(
        "Free plan limit reached. Upgrade to Pro for unlimited public links."
      );
    }

    // Validate slug format (alphanumeric, hyphens, underscores)
    const slugRegex = /^[a-z0-9]([a-z0-9-_]*[a-z0-9])?$/i;
    if (!slugRegex.test(args.slug)) {
      throw new Error(
        "Invalid slug format. Use only letters, numbers, hyphens, and underscores."
      );
    }

    // Check if slug is already taken
    const existingSlug = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    if (existingSlug) {
      throw new Error("This slug is already taken");
    }

    // If a community is specified, verify ownership
    if (args.activeCommunityId) {
      const community = await ctx.db.get(args.activeCommunityId);
      if (!community || community.userId !== user._id) {
        throw new Error("Community not found");
      }
    }

    const linkId = await ctx.db.insert("publicJoinLinks", {
      userId: user._id,
      slug: args.slug.toLowerCase(),
      activeCommunityId: args.activeCommunityId,
      isActive: true,
      createdAt: Date.now(),
    });

    return linkId;
  },
});

export const update = mutation({
  args: {
    id: v.id("publicJoinLinks"),
    slug: v.optional(v.string()),
    activeCommunityId: v.optional(v.id("communities")),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== user._id) {
      throw new Error("Link not found");
    }

    const updates: Partial<{
      slug: string;
      activeCommunityId: typeof args.activeCommunityId;
      isActive: boolean;
    }> = {};

    if (args.slug !== undefined) {
      const slugRegex = /^[a-z0-9]([a-z0-9-_]*[a-z0-9])?$/i;
      if (!slugRegex.test(args.slug)) {
        throw new Error(
          "Invalid slug format. Use only letters, numbers, hyphens, and underscores."
        );
      }

      // Check if new slug is already taken (by someone else)
      const existingSlug = await ctx.db
        .query("publicJoinLinks")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug!.toLowerCase()))
        .first();

      if (existingSlug && existingSlug._id !== args.id) {
        throw new Error("This slug is already taken");
      }

      updates.slug = args.slug.toLowerCase();
    }

    if (args.activeCommunityId !== undefined) {
      if (args.activeCommunityId) {
        const community = await ctx.db.get(args.activeCommunityId);
        if (!community || community.userId !== user._id) {
          throw new Error("Community not found");
        }
      }
      updates.activeCommunityId = args.activeCommunityId;
    }

    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("publicJoinLinks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== user._id) {
      throw new Error("Link not found");
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const checkSlugAvailable = query({
  args: { slug: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existingSlug = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug.toLowerCase()))
      .first();

    return !existingSlug;
  },
});
