import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { internal } from "./_generated/api";

const http = httpRouter();

// Register Better Auth routes
authComponent.registerRoutes(http, createAuth);

// DodoPayments webhook handler for subscription management
http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    // Handle subscription activation
    onSubscriptionActive: async (ctx, payload) => {
      console.log("🎉 Subscription Activated!", payload.data.subscription_id);
      await ctx.runMutation(internal.webhooks.activateSubscriptionByEmail, {
        customerEmail: payload.data.customer.email,
        subscriptionId: payload.data.subscription_id,
        customerId: payload.data.customer.customer_id,
      });
    },

    // Handle subscription cancellation
    onSubscriptionCancelled: async (ctx, payload) => {
      console.log("❌ Subscription Cancelled!", payload.data.subscription_id);
      await ctx.runMutation(internal.webhooks.cancelSubscription, {
        subscriptionId: payload.data.subscription_id,
      });
    },

    // Handle subscription expiration (on_hold)
    onSubscriptionOnHold: async (ctx, payload) => {
      console.log("⏸️ Subscription On Hold!", payload.data.subscription_id);
      await ctx.runMutation(internal.webhooks.expireSubscription, {
        subscriptionId: payload.data.subscription_id,
      });
    },

    // Handle subscription renewal
    onSubscriptionRenewed: async (ctx, payload) => {
      console.log("🔄 Subscription Renewed!", payload.data.subscription_id);
      await ctx.runMutation(internal.webhooks.renewSubscription, {
        subscriptionId: payload.data.subscription_id,
      });
    },

    // Handle successful payment
    onPaymentSucceeded: async (ctx, payload) => {
      console.log("💰 Payment Succeeded!", payload.data.payment_id);
    },
  }),
});

export default http;
