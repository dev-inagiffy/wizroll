import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Internal query to find subscription by dodoSubscriptionId
export const getSubscriptionByDodoId = internalQuery({
  args: { dodoSubscriptionId: v.string() },
  handler: async (ctx, { dodoSubscriptionId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_dodo_subscription", (q) =>
        q.eq("dodoSubscriptionId", dodoSubscriptionId)
      )
      .first();
  },
});

// Internal query to find subscription by dodoCustomerId
export const getSubscriptionByCustomerId = internalQuery({
  args: { dodoCustomerId: v.string() },
  handler: async (ctx, { dodoCustomerId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_dodo_customer", (q) =>
        q.eq("dodoCustomerId", dodoCustomerId)
      )
      .first();
  },
});

// Handle subscription activation by email (called from @dodopayments/convex webhook)
export const activateSubscriptionByEmail = internalMutation({
  args: {
    customerEmail: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    // First check if we have an existing subscription by email
    const existingByEmail = await ctx.db
      .query("subscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.customerEmail))
      .first();

    if (existingByEmail) {
      // Update existing subscription
      await ctx.db.patch(existingByEmail._id, {
        plan: "pro",
        status: "active",
        dodoSubscriptionId: args.subscriptionId,
        dodoCustomerId: args.customerId,
        updatedAt: Date.now(),
      });
      console.log(`Subscription activated for email: ${args.customerEmail}`);
      return existingByEmail._id;
    }

    // Check by customer ID
    const existingByCustomer = await ctx.db
      .query("subscriptions")
      .withIndex("by_dodo_customer", (q) => q.eq("dodoCustomerId", args.customerId))
      .first();

    if (existingByCustomer) {
      await ctx.db.patch(existingByCustomer._id, {
        email: args.customerEmail,
        plan: "pro",
        status: "active",
        dodoSubscriptionId: args.subscriptionId,
        updatedAt: Date.now(),
      });
      console.log(`Subscription activated by customer ID: ${args.customerId}`);
      return existingByCustomer._id;
    }

    // Create new subscription with email (will be linked to user later)
    // Use email as temporary userId for now - will be updated when user syncs
    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: `email:${args.customerEmail}`, // Temporary, will be updated
      email: args.customerEmail,
      plan: "pro",
      status: "active",
      dodoSubscriptionId: args.subscriptionId,
      dodoCustomerId: args.customerId,
      updatedAt: Date.now(),
    });

    console.log(`New subscription created for email: ${args.customerEmail}`);
    return subscriptionId;
  },
});

// Handle subscription cancellation
export const cancelSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_dodo_subscription", (q) =>
        q.eq("dodoSubscriptionId", args.subscriptionId)
      )
      .first();

    if (!subscription) {
      console.error(`Subscription not found: ${args.subscriptionId}`);
      return null;
    }

    await ctx.db.patch(subscription._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    console.log(`Subscription cancelled: ${args.subscriptionId}`);
    return subscription._id;
  },
});

// Handle subscription expiration
export const expireSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_dodo_subscription", (q) =>
        q.eq("dodoSubscriptionId", args.subscriptionId)
      )
      .first();

    if (!subscription) {
      console.error(`Subscription not found: ${args.subscriptionId}`);
      return null;
    }

    await ctx.db.patch(subscription._id, {
      plan: "free",
      status: "expired",
      updatedAt: Date.now(),
    });

    console.log(`Subscription expired: ${args.subscriptionId}`);
    return subscription._id;
  },
});

// Handle subscription renewal/update
export const renewSubscription = internalMutation({
  args: {
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_dodo_subscription", (q) =>
        q.eq("dodoSubscriptionId", args.subscriptionId)
      )
      .first();

    if (!subscription) {
      console.error(`Subscription not found: ${args.subscriptionId}`);
      return null;
    }

    await ctx.db.patch(subscription._id, {
      plan: "pro",
      status: "active",
      updatedAt: Date.now(),
    });

    console.log(`Subscription renewed: ${args.subscriptionId}`);
    return subscription._id;
  },
});
