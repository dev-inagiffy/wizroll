# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Convex backend is automatically synced in development when `pnpm dev` runs.

## Architecture

This is a Next.js 16 app using **Convex** as the backend database and **Better Auth** for authentication with **DodoPayments** for payment processing.

### Key Integrations

- **Convex + Better Auth**: Authentication is handled via `@convex-dev/better-auth`. The auth component is configured in `convex/auth.ts` and exposed through `convex/http.ts`.
- **DodoPayments**: Payment integration using `@dodopayments/better-auth` plugin with checkout, portal, webhooks, and usage tracking.
- **UI Components**: shadcn/ui with `radix-nova` style and `hugeicons` icon library. Components are in `components/ui/`.

### Directory Structure

- `app/` - Next.js App Router pages and layouts
- `convex/` - Convex backend functions, schema, and auth configuration
- `components/ui/` - shadcn/ui components
- `lib/auth-client.ts` - Client-side Better Auth instance
- `lib/auth-server.ts` - Server-side auth utilities

### Convex Patterns

Follow the Convex guidelines in `.cursor/rules/convex_rules.mdc`:
- Always use the new function syntax with `args` and `returns` validators
- Use `v.null()` for functions that return null
- Use `internalQuery`/`internalMutation`/`internalAction` for private functions
- Define schema in `convex/schema.ts` with proper indexes
- HTTP endpoints go in `convex/http.ts`

### Auth Flow

1. Client uses `authClient` from `lib/auth-client.ts`
2. `ConvexClientProvider` wraps the app with `ConvexBetterAuthProvider`
3. Backend auth is configured in `convex/auth.ts` with `createAuth()`
4. Use `authComponent.getAuthUser(ctx)` in Convex functions to get current user

### Environment Variables Required

- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `SITE_URL` - Base URL for auth callbacks
- `DODO_PAYMENTS_API_KEY` - DodoPayments API key
- `DODO_PAYMENTS_WEBHOOK_SECRET` - Webhook verification secret
