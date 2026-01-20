import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const listByPublicLink = query({
  args: {
    publicLinkId: v.id("publicJoinLinks"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("joinEvents"),
      _creationTime: v.number(),
      publicJoinLinkId: v.id("publicJoinLinks"),
      communityId: v.id("communities"),
      communityLinkId: v.id("communityLinks"),
      timestamp: v.number(),
      ipHash: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return [];
    }

    // Verify user owns this public link
    const publicLink = await ctx.db.get(args.publicLinkId);
    if (!publicLink || publicLink.userId !== user._id) {
      return [];
    }

    const limit = args.limit ?? 100;
    const events = await ctx.db
      .query("joinEvents")
      .withIndex("by_public_link", (q) =>
        q.eq("publicJoinLinkId", args.publicLinkId)
      )
      .order("desc")
      .take(limit);

    return events;
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalJoins: v.number(),
    joinsToday: v.number(),
    joinsThisWeek: v.number(),
    joinsThisMonth: v.number(),
    joinsByDay: v.array(
      v.object({
        date: v.string(),
        count: v.number(),
      })
    ),
  }),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return {
        totalJoins: 0,
        joinsToday: 0,
        joinsThisWeek: 0,
        joinsThisMonth: 0,
        joinsByDay: [],
      };
    }

    // Get all public links for this user
    const publicLinks = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (publicLinks.length === 0) {
      return {
        totalJoins: 0,
        joinsToday: 0,
        joinsThisWeek: 0,
        joinsThisMonth: 0,
        joinsByDay: [],
      };
    }

    // Get all events for this user's public links
    const allEvents: Array<{
      _id: string;
      timestamp: number;
    }> = [];

    for (const link of publicLinks) {
      const events = await ctx.db
        .query("joinEvents")
        .withIndex("by_public_link", (q) => q.eq("publicJoinLinkId", link._id))
        .collect();
      allEvents.push(...events);
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const totalJoins = allEvents.length;
    const joinsToday = allEvents.filter((e) => e.timestamp >= oneDayAgo).length;
    const joinsThisWeek = allEvents.filter(
      (e) => e.timestamp >= oneWeekAgo
    ).length;
    const joinsThisMonth = allEvents.filter(
      (e) => e.timestamp >= oneMonthAgo
    ).length;

    // Group by day for last 30 days
    const joinsByDayMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      joinsByDayMap[dateStr] = 0;
    }

    for (const event of allEvents) {
      const dateStr = new Date(event.timestamp).toISOString().split("T")[0];
      if (joinsByDayMap[dateStr] !== undefined) {
        joinsByDayMap[dateStr]++;
      }
    }

    const joinsByDay = Object.entries(joinsByDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalJoins,
      joinsToday,
      joinsThisWeek,
      joinsThisMonth,
      joinsByDay,
    };
  },
});

export const getStatsByCommunity = query({
  args: { communityId: v.id("communities") },
  returns: v.object({
    totalJoins: v.number(),
    joinsToday: v.number(),
    joinsThisWeek: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return {
        totalJoins: 0,
        joinsToday: 0,
        joinsThisWeek: 0,
      };
    }

    // Verify user owns this community
    const community = await ctx.db.get(args.communityId);
    if (!community || community.userId !== user._id) {
      return {
        totalJoins: 0,
        joinsToday: 0,
        joinsThisWeek: 0,
      };
    }

    // Get all events for this community
    // Since we don't have a direct index, we'll use the public links approach
    const publicLinks = await ctx.db
      .query("publicJoinLinks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const relevantLinks = publicLinks.filter(
      (link) => link.activeCommunityId === args.communityId
    );

    const allEvents: Array<{
      _id: string;
      timestamp: number;
      communityId: string;
    }> = [];

    for (const link of relevantLinks) {
      const events = await ctx.db
        .query("joinEvents")
        .withIndex("by_public_link", (q) => q.eq("publicJoinLinkId", link._id))
        .collect();
      allEvents.push(
        ...events.filter((e) => e.communityId === args.communityId)
      );
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      totalJoins: allEvents.length,
      joinsToday: allEvents.filter((e) => e.timestamp >= oneDayAgo).length,
      joinsThisWeek: allEvents.filter((e) => e.timestamp >= oneWeekAgo).length,
    };
  },
});
