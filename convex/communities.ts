import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { checkUserSubscription, PLAN_LIMITS } from "./subscriptions";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("communities"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      logoStorageId: v.optional(v.id("_storage")),
      backgroundStorageId: v.optional(v.id("_storage")),
      logoUrl: v.optional(v.string()),
      backgroundUrl: v.optional(v.string()),
      maxMembers: v.number(),
      currentMembers: v.number(),
      isActive: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }
    const communities = await ctx.db
      .query("communities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Resolve storage URLs
    const communitiesWithUrls = await Promise.all(
      communities.map(async (community) => {
        const logoUrl = community.logoStorageId
          ? await ctx.storage.getUrl(community.logoStorageId)
          : null;
        const backgroundUrl = community.backgroundStorageId
          ? await ctx.storage.getUrl(community.backgroundStorageId)
          : null;
        return {
          ...community,
          logoUrl: logoUrl ?? undefined,
          backgroundUrl: backgroundUrl ?? undefined,
        };
      })
    );

    return communitiesWithUrls;
  },
});

export const get = query({
  args: { id: v.id("communities") },
  returns: v.union(
    v.object({
      _id: v.id("communities"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.string(),
      logoStorageId: v.optional(v.id("_storage")),
      backgroundStorageId: v.optional(v.id("_storage")),
      logoUrl: v.optional(v.string()),
      backgroundUrl: v.optional(v.string()),
      maxMembers: v.number(),
      currentMembers: v.number(),
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
    const community = await ctx.db.get(args.id);
    if (!community || community.userId !== user._id) {
      return null;
    }

    // Resolve storage URLs
    const logoUrl = community.logoStorageId
      ? await ctx.storage.getUrl(community.logoStorageId)
      : null;
    const backgroundUrl = community.backgroundStorageId
      ? await ctx.storage.getUrl(community.backgroundStorageId)
      : null;

    return {
      ...community,
      logoUrl: logoUrl ?? undefined,
      backgroundUrl: backgroundUrl ?? undefined,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    logoStorageId: v.optional(v.id("_storage")),
    backgroundStorageId: v.optional(v.id("_storage")),
    maxMembers: v.number(),
  },
  returns: v.id("communities"),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Check subscription status
    const { isPro } = await checkUserSubscription(ctx, user._id);
    const limit = isPro ? PLAN_LIMITS.pro.communities : PLAN_LIMITS.free.communities;

    // Check plan limit
    const existingCommunities = await ctx.db
      .query("communities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (!isPro && existingCommunities.length >= limit) {
      throw new Error(
        "Free plan limit reached. Upgrade to Pro for unlimited communities."
      );
    }

    const communityId = await ctx.db.insert("communities", {
      userId: user._id,
      name: args.name,
      logoStorageId: args.logoStorageId,
      backgroundStorageId: args.backgroundStorageId,
      maxMembers: args.maxMembers,
      currentMembers: 0,
      isActive: true,
      createdAt: Date.now(),
    });

    return communityId;
  },
});

export const update = mutation({
  args: {
    id: v.id("communities"),
    name: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    backgroundStorageId: v.optional(v.id("_storage")),
    removeLogoStorageId: v.optional(v.boolean()),
    removeBackgroundStorageId: v.optional(v.boolean()),
    maxMembers: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const community = await ctx.db.get(args.id);
    if (!community || community.userId !== user._id) {
      throw new Error("Community not found");
    }

    const updates: Partial<{
      name: string;
      logoStorageId: Id<"_storage"> | undefined;
      backgroundStorageId: Id<"_storage"> | undefined;
      maxMembers: number;
      isActive: boolean;
    }> = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.logoStorageId !== undefined) {
      // Delete old logo if exists
      if (community.logoStorageId) {
        await ctx.storage.delete(community.logoStorageId);
      }
      updates.logoStorageId = args.logoStorageId;
    }
    if (args.removeLogoStorageId && community.logoStorageId) {
      await ctx.storage.delete(community.logoStorageId);
      updates.logoStorageId = undefined;
    }
    if (args.backgroundStorageId !== undefined) {
      // Delete old background if exists
      if (community.backgroundStorageId) {
        await ctx.storage.delete(community.backgroundStorageId);
      }
      updates.backgroundStorageId = args.backgroundStorageId;
    }
    if (args.removeBackgroundStorageId && community.backgroundStorageId) {
      await ctx.storage.delete(community.backgroundStorageId);
      updates.backgroundStorageId = undefined;
    }
    if (args.maxMembers !== undefined) updates.maxMembers = args.maxMembers;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("communities") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const community = await ctx.db.get(args.id);
    if (!community || community.userId !== user._id) {
      throw new Error("Community not found");
    }

    // Delete stored images
    if (community.logoStorageId) {
      await ctx.storage.delete(community.logoStorageId);
    }
    if (community.backgroundStorageId) {
      await ctx.storage.delete(community.backgroundStorageId);
    }

    // Delete all associated community links
    const links = await ctx.db
      .query("communityLinks")
      .withIndex("by_community", (q) => q.eq("communityId", args.id))
      .collect();

    for (const link of links) {
      await ctx.db.delete(link._id);
    }

    // Update public join links that reference this community
    const publicLinks = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const publicLink of publicLinks) {
      if (publicLink.activeCommunityId === args.id) {
        await ctx.db.patch(publicLink._id, { activeCommunityId: undefined });
      }
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

export const updateMemberCount = mutation({
  args: {
    id: v.id("communities"),
    currentMembers: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const community = await ctx.db.get(args.id);
    if (!community || community.userId !== user._id) {
      throw new Error("Community not found");
    }

    await ctx.db.patch(args.id, { currentMembers: args.currentMembers });
    return null;
  },
});
