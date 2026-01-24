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
      description: v.optional(v.string()),
      logoStorageId: v.optional(v.id("_storage")),
      logoUrl: v.optional(v.string()),
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

    const communitiesWithUrls = await Promise.all(
      communities.map(async (community) => {
        let logoUrl: string | null = null;
        if (community.logoStorageId) {
          try {
            logoUrl = await ctx.storage.getUrl(community.logoStorageId);
          } catch {
            // Storage ID invalid, ignore
          }
        }
        return {
          _id: community._id,
          _creationTime: community._creationTime,
          userId: community.userId,
          name: community.name,
          description: community.description,
          logoStorageId: community.logoStorageId,
          logoUrl: logoUrl ?? undefined,
          maxMembers: community.maxMembers,
          currentMembers: community.currentMembers,
          isActive: community.isActive,
          createdAt: community.createdAt,
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
      description: v.optional(v.string()),
      logoStorageId: v.optional(v.id("_storage")),
      logoUrl: v.optional(v.string()),
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

    let logoUrl: string | null = null;
    if (community.logoStorageId) {
      try {
        logoUrl = await ctx.storage.getUrl(community.logoStorageId);
      } catch {
        // Storage ID invalid, ignore
      }
    }

    return {
      _id: community._id,
      _creationTime: community._creationTime,
      userId: community.userId,
      name: community.name,
      description: community.description,
      logoStorageId: community.logoStorageId,
      logoUrl: logoUrl ?? undefined,
      maxMembers: community.maxMembers,
      currentMembers: community.currentMembers,
      isActive: community.isActive,
      createdAt: community.createdAt,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    logoStorageId: v.optional(v.string()),
    maxMembers: v.number(),
  },
  returns: v.id("communities"),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const { isPro } = await checkUserSubscription(ctx, user._id);
    const limit = isPro ? PLAN_LIMITS.pro.communities : PLAN_LIMITS.free.communities;

    const existingCommunities = await ctx.db
      .query("communities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (!isPro && existingCommunities.length >= limit) {
      throw new Error(
        "Free plan limit reached. Upgrade to Pro for unlimited communities."
      );
    }

    // Validate logo storage ID if provided
    let validLogoStorageId: Id<"_storage"> | undefined;
    if (args.logoStorageId) {
      try {
        const url = await ctx.storage.getUrl(args.logoStorageId as Id<"_storage">);
        if (url) {
          validLogoStorageId = args.logoStorageId as Id<"_storage">;
        }
      } catch {
        // Invalid storage ID, ignore
      }
    }

    const communityId = await ctx.db.insert("communities", {
      userId: user._id,
      name: args.name,
      description: args.description,
      logoStorageId: validLogoStorageId,
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
    description: v.optional(v.string()),
    logoStorageId: v.optional(v.string()),
    removeLogoStorageId: v.optional(v.boolean()),
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
      description: string | undefined;
      logoStorageId: Id<"_storage"> | undefined;
      maxMembers: number;
      isActive: boolean;
    }> = {};

    // Helper to safely delete storage
    const safeDeleteStorage = async (storageId: Id<"_storage">) => {
      try {
        await ctx.storage.delete(storageId);
      } catch {
        // Storage may already be deleted
      }
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    // Handle logo update
    if (args.logoStorageId !== undefined) {
      // Validate new storage ID
      let validNewLogoId: Id<"_storage"> | undefined;
      try {
        const url = await ctx.storage.getUrl(args.logoStorageId as Id<"_storage">);
        if (url) {
          validNewLogoId = args.logoStorageId as Id<"_storage">;
        }
      } catch {
        // Invalid storage ID
      }

      if (validNewLogoId && validNewLogoId !== community.logoStorageId) {
        // Delete old logo if exists
        if (community.logoStorageId) {
          await safeDeleteStorage(community.logoStorageId);
        }
        updates.logoStorageId = validNewLogoId;
      }
    }

    // Handle logo removal
    if (args.removeLogoStorageId && community.logoStorageId) {
      await safeDeleteStorage(community.logoStorageId);
      updates.logoStorageId = undefined;
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

    // Delete stored logo
    if (community.logoStorageId) {
      try {
        await ctx.storage.delete(community.logoStorageId);
      } catch {
        // Ignore if already deleted
      }
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
