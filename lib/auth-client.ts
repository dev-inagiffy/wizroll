import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { dodopaymentsClient } from "@dodopayments/better-auth";

export const authClient = createAuthClient({
  plugins: [convexClient(), dodopaymentsClient()],
});
