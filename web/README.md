# Hive Web Migration

This package is the in-progress migration target for the product app.

## Target stack
- Next.js App Router for the product frontend
- Convex for app data, auth, and server functions
- Elysia mounted behind Next route handlers for HTTP-specific APIs
- Google-only sign-in

## Current scope
- Product app shell and route structure
- Convex schema and function scaffolding
- Embedded Elysia API bootstrap
- Migration-safe foundation that leaves `frontend/`, `backend/`, and `functions/` untouched

## Setup

```bash
cd web
npm install
npx convex dev
npm run dev
```

## Required environment

Create `web/.env.local` with the values needed for local development:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
RESEND_API_KEY=
```

`RESEND_API_KEY` is optional and only needed if invite emails remain email-based.

## Notes
- Convex Auth in Next.js is still evolving, so this package starts with schema and provider scaffolding first.
- Run `npx convex dev` before wiring client queries to generate `convex/_generated/*`.
- The legacy apps remain the source of truth until the new package reaches feature parity.
