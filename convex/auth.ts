import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";
import {
  dodopayments,
  checkout,
  portal,
  webhooks,
  usage,
} from "@dodopayments/better-auth";
import DodoPayments from "dodopayments";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const dodoPayments = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: "test_mode",
});

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    trustedOrigins: ["https://dodo.axontech.in"],
    plugins: [
      dodopayments({
        client: dodoPayments,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: "pdt_8c0n2OZYwhf1sbu8htxMg",
                slug: "premium-plan",
              },
            ],
            successUrl: "/dashboard/success",
            authenticatedUsersOnly: true,
          }),
          portal(),
          webhooks({
            webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
            onPayload: async (payload) => {
              console.log("Received webhook:", payload.type);
            },
          }),
          usage(),
        ],
      }),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
