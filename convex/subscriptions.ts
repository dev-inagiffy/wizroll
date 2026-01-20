import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { Id } from "./_generated/dataModel";
import { QueryCtx, MutationCtx } from "./_generated/server";

// Plan limits
export const PLAN_LIMITS = {
  free: {
    communities: 1,
    publicLinks: 1,
  },
  pro: {
    communities: Infinity,
    publicLinks: Infinity,
  },
};

// Helper function to check if user has pro subscription
export async function checkUserSubscription(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<{ isPro: boolean; plan: "free" | "pro" }> {
  // TEMPORARILY DISABLED: Make everything unlimited (like pro plan) for testing
  // Remove this block and uncomment the code below to re-enable subscription checks
  return { isPro: true, plan: "pro" };

  /*
  // ORIGINAL SUBSCRIPTION CHECK - COMMENTED OUT FOR TESTING
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (subscription && subscription.plan === "pro" && subscription.status === "active") {
    // Check if subscription hasn't expired
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > Date.now()) {
      return { isPro: true, plan: "pro" };
    }
  }

  return { isPro: false, plan: "free" };
  */
}

// Get current user's subscription status
export const getSubscription = query({
  args: {},
  returns: v.union(
    v.object({
      plan: v.union(v.literal("free"), v.literal("pro")),
      status: v.union(
        v.literal("active"),
        v.literal("cancelled"),
        v.literal("expired")
      ),
      currentPeriodEnd: v.optional(v.number()),
      limits: v.object({
        communities: v.number(),
        publicLinks: v.number(),
      }),
      needsLink: v.optional(v.boolean()), // Indicates subscription found by email needs linking
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      return null;
    }

    // First try to find subscription by userId
    let subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    let needsLink = false;

    // If not found and user has email, try to find by email
    if (!subscription && user.email) {
      subscription = await ctx.db
        .query("subscriptions")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .first();

      // Mark that this subscription needs to be linked to the user
      if (subscription) {
        needsLink = true;
      }
    }

    if (!subscription) {
      // No subscription record, default to free
      return {
        plan: "free" as const,
        status: "active" as const,
        currentPeriodEnd: undefined,
        limits: PLAN_LIMITS.free,
      };
    }

    const plan = subscription.plan;
    return {
      plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      limits: plan === "pro" ?
        { communities: -1, publicLinks: -1 } : // -1 means unlimited
        PLAN_LIMITS.free,
      needsLink,
    };
  },
});

// Mutation to link subscription found by email to the current user
export const linkSubscription = mutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user || !user.email) {
      return false;
    }

    // Find subscription by email
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .first();

    if (!subscription) {
      return false;
    }

    // Link it to the user
    await ctx.db.patch(subscription._id, {
      userId: user._id,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Internal mutation to update subscription (called by webhook)
export const updateSubscription = internalMutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
    dodoSubscriptionId: v.optional(v.string()),
    dodoCustomerId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: args.plan,
        status: args.status,
        dodoSubscriptionId: args.dodoSubscriptionId,
        dodoCustomerId: args.dodoCustomerId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        plan: args.plan,
        status: args.status,
        dodoSubscriptionId: args.dodoSubscriptionId,
        dodoCustomerId: args.dodoCustomerId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

// Mutation for users to manually refresh/sync their subscription
// This is useful if webhook fails or for testing
export const syncSubscription = mutation({
  args: {
    dodoSubscriptionId: v.optional(v.string()),
    isActive: v.boolean(),
    currentPeriodEnd: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const plan = args.isActive ? "pro" : "free";
    const status = args.isActive ? "active" : "expired";

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan,
        status,
        dodoSubscriptionId: args.dodoSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: user._id,
        plan,
        status,
        dodoSubscriptionId: args.dodoSubscriptionId,
        currentPeriodEnd: args.currentPeriodEnd,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});
