import { query } from "./_generated/server";
import { v } from "convex/values";

// Private invite code for signup - change this to invalidate old codes
// IMPORTANT: Keep this secret! Only share with people you want to allow signup
const VALID_INVITE_CODE = "WR2025XKQJ7M9NP3RFVB8THWYCGDL6S4A2";

// Validate invite code for signup
export const validate = query({
  args: {
    code: v.string(),
  },
  returns: v.object({
    valid: v.boolean(),
    message: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    const isValid = args.code.trim().toUpperCase() === VALID_INVITE_CODE;

    if (!isValid) {
      return {
        valid: false,
        message: "Invalid invite code. Signups are currently invite-only.",
      };
    }

    return {
      valid: true,
    };
  },
});
