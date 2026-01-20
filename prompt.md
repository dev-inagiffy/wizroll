You are a senior full-stack engineer.

I am building a small SaaS tool focused on **WhatsApp Community link rollover**.

### Tech stack (fixed, do not change)

- **Frontend**: Next.js App Router + **shadcn/ui**
- **Backend**: **Convex**
- **Auth**: **Better Auth** (Organization plugin enabled)
- **Payments**: **Dodo Payments**
- **Styling**: shadcn + my existing design system
  → **IMPORTANT**: Stick strictly to the existing design language, spacing, typography, colors, and components. Do not invent new styles.

I will handle:

- Better Auth base setup with Convex
- Dodo Payments base setup
- Global layout, theme, and tokens

You must focus only on **product logic, data models, and UI flows**.

---

## Product: WhatsApp Community Link Rollover Tool

### Core idea

Users create a **single public join link** that automatically rolls over between multiple WhatsApp community invite links when one community is full.

---

## Authentication & Org Model

- Use **Better Auth Organizations**
- Each **Organization** owns:
  - Communities
  - Links
  - Usage / limits

- Users can belong to multiple orgs
- All data is scoped by `organizationId`

---

## Data Models (Convex)

Design Convex schemas for:

### OrganizationCommunity

- id
- organizationId
- name
- logoUrl
- backgroundImageUrl
- maxMembers
- currentMembers
- isActive
- createdAt

### CommunityLink

- id
- organizationId
- communityId
- whatsappInviteUrl
- priorityOrder
- isExhausted
- createdAt

### PublicJoinLink

- id
- organizationId
- slug (unique, public)
- activeCommunityId
- createdAt

### JoinEvent (analytics)

- id
- publicJoinLinkId
- communityId
- timestamp
- ipHash (optional)
- userAgent (optional)

---

## Core Logic

- When a user visits a **public join link**:
  1. Resolve the active community
  2. Show a landing page with:
     - Background image
     - Logo
     - Community name
     - Join button

  3. On button click:
     - Redirect to WhatsApp invite link
     - Increment `currentMembers`
     - Log a JoinEvent

  4. If `currentMembers >= maxMembers`:
     - Mark community as exhausted
     - Automatically switch to next available community
     - Update `activeCommunityId`

⚠️ No WhatsApp API assumptions. Member count is **manual + inferred clicks**.

---

## Admin UI (Authenticated)

Using **shadcn/ui only**:

### Pages

- Dashboard
- Communities list
- Create / edit community
- Public link management
- Organization switcher (Better Auth orgs)

### Forms

- Create community
  - Name
  - Logo upload (URL input is fine)
  - Background image URL
  - Max members
  - Initial current members
  - Multiple WhatsApp invite links

- Create public join link
  - Slug
  - Select starting community

---

## Payments (Assumptions)

- Gate features by plan (Free / Pro)
- Example limits:
  - Free: 1 public link, 1 community
  - Pro: unlimited

- Assume subscription status is already available in backend

Do NOT implement payment UI.
Just respect feature limits in logic.

---

## Non-Goals (Do NOT build)

- WhatsApp API integration
- Real member verification
- Notifications
- Marketing pages

---

## Output expectations

- Convex schema definitions
- Convex mutations & queries
- Next.js server + client components
- Clean folder structure
- Clear comments where assumptions are made

Keep everything minimal, production-ready, and extensible.

Do not over-engineer.

### Additional Requirement: Dark / Light Mode

Implement a **theme switcher (Light / Dark / System)**.

#### Constraints

- Use **Next.js App Router**
- Use **shadcn/ui** theming conventions
- Respect my existing design system (colors, tokens, spacing)
- Do NOT introduce custom CSS themes outside the system

#### Behavior

- Theme options:
  - Light
  - Dark
  - System (default)

- Persist preference per **user** (not per org)
- Fallback to System if no preference is set
- No page reload on toggle

#### Placement

- Add theme switcher in **Settings page**
- Optionally mirror it in:
  - User dropdown / profile menu (if exists)

#### Technical Notes

- Use `next-themes` (preferred)
- Store preference in:
  - User profile (Convex) OR
  - Local storage (acceptable fallback)

- Ensure SSR-safe hydration (no flashing)

#### UI

- Use shadcn components only
- Simple toggle or segmented control
- Minimal. No animations unless already part of the system.

Do not redesign layouts.
Just integrate cleanly.
