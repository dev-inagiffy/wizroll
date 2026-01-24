import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User subscriptions - tracks DodoPayments subscription status
  subscriptions: defineTable({
    userId: v.string(),
    email: v.optional(v.string()), // For matching via webhook
    plan: v.union(v.literal("free"), v.literal("pro")),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("expired")
    ),
    dodoSubscriptionId: v.optional(v.string()),
    dodoCustomerId: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_dodo_subscription", ["dodoSubscriptionId"])
    .index("by_dodo_customer", ["dodoCustomerId"]),

  communities: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    backgroundStorageId: v.optional(v.id("_storage")),
    maxMembers: v.number(),
    currentMembers: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  communityLinks: defineTable({
    userId: v.string(),
    communityId: v.id("communities"),
    whatsappInviteUrl: v.string(),
    priorityOrder: v.number(),
    isExhausted: v.boolean(),
    memberCount: v.number(),
    maxMembers: v.number(),
    createdAt: v.number(),
  })
    .index("by_community", ["communityId"])
    .index("by_community_priority", ["communityId", "priorityOrder"]),

  publicJoinLinks: defineTable({
    userId: v.string(),
    slug: v.string(),
    activeCommunityId: v.optional(v.id("communities")),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_user", ["userId"]),

  joinEvents: defineTable({
    publicJoinLinkId: v.id("publicJoinLinks"),
    communityId: v.id("communities"),
    communityLinkId: v.id("communityLinks"),
    timestamp: v.number(),
    ipHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_public_link", ["publicJoinLinkId"])
    .index("by_timestamp", ["timestamp"]),
});
