import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const listByCommunity = query({
  args: { communityId: v.id("communities") },
  returns: v.array(
    v.object({
      _id: v.id("communityLinks"),
      _creationTime: v.number(),
      userId: v.string(),
      communityId: v.id("communities"),
      whatsappInviteUrl: v.string(),
      priorityOrder: v.number(),
      isExhausted: v.boolean(),
      memberCount: v.number(),
      maxMembers: v.number(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    // Verify user owns this community
    const community = await ctx.db.get(args.communityId);
    if (!community || community.userId !== user._id) {
      return [];
    }

    const links = await ctx.db
      .query("communityLinks")
      .withIndex("by_community_priority", (q) =>
        q.eq("communityId", args.communityId)
      )
      .order("asc")
      .collect();

    return links;
  },
});

export const create = mutation({
  args: {
    communityId: v.id("communities"),
    whatsappInviteUrl: v.string(),
    maxMembers: v.optional(v.number()),
  },
  returns: v.id("communityLinks"),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify user owns this community
    const community = await ctx.db.get(args.communityId);
    if (!community || community.userId !== user._id) {
      throw new Error("Community not found");
    }

    // Validate WhatsApp invite URL
    if (!args.whatsappInviteUrl.includes("chat.whatsapp.com")) {
      throw new Error("Invalid WhatsApp invite URL");
    }

    // Get the next priority order
    const existingLinks = await ctx.db
      .query("communityLinks")
      .withIndex("by_community", (q) => q.eq("communityId", args.communityId))
      .collect();

    const maxPriority =
      existingLinks.length > 0
        ? Math.max(...existingLinks.map((l) => l.priorityOrder))
        : 0;

    const linkId = await ctx.db.insert("communityLinks", {
      userId: user._id,
      communityId: args.communityId,
      whatsappInviteUrl: args.whatsappInviteUrl,
      priorityOrder: maxPriority + 1,
      isExhausted: false,
      memberCount: 0,
      maxMembers: args.maxMembers ?? 256,
      createdAt: Date.now(),
    });

    return linkId;
  },
});

export const update = mutation({
  args: {
    id: v.id("communityLinks"),
    whatsappInviteUrl: v.optional(v.string()),
    isExhausted: v.optional(v.boolean()),
    memberCount: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
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
      whatsappInviteUrl: string;
      isExhausted: boolean;
      memberCount: number;
      maxMembers: number;
    }> = {};

    if (args.whatsappInviteUrl !== undefined) {
      if (!args.whatsappInviteUrl.includes("chat.whatsapp.com")) {
        throw new Error("Invalid WhatsApp invite URL");
      }
      updates.whatsappInviteUrl = args.whatsappInviteUrl;
    }
    if (args.isExhausted !== undefined) updates.isExhausted = args.isExhausted;
    if (args.memberCount !== undefined) updates.memberCount = args.memberCount;
    if (args.maxMembers !== undefined) updates.maxMembers = args.maxMembers;

    await ctx.db.patch(args.id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("communityLinks") },
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

export const reorder = mutation({
  args: {
    communityId: v.id("communities"),
    linkIds: v.array(v.id("communityLinks")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify user owns this community
    const community = await ctx.db.get(args.communityId);
    if (!community || community.userId !== user._id) {
      throw new Error("Community not found");
    }

    // Update priority order for each link
    for (let i = 0; i < args.linkIds.length; i++) {
      const link = await ctx.db.get(args.linkIds[i]);
      if (link && link.communityId === args.communityId) {
        await ctx.db.patch(args.linkIds[i], { priorityOrder: i + 1 });
      }
    }

    return null;
  },
});

export const markExhausted = mutation({
  args: { id: v.id("communityLinks") },
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

    await ctx.db.patch(args.id, { isExhausted: true });
    return null;
  },
});

export const resetExhausted = mutation({
  args: { id: v.id("communityLinks") },
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

    await ctx.db.patch(args.id, { isExhausted: false });
    return null;
  },
});
