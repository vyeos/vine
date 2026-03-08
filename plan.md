# Full Migration Plan: React/Node/Postgres to Next.js + Elysia + Convex with Google-Only Auth

## Summary
- Rebuild the product as a single Next.js application using the App Router, with Elysia embedded inside the same app for HTTP-only concerns.
- Replace the current React Router + REST + Postgres architecture with Next.js + Convex for product data and state, and Elysia only for HTTP surfaces that still need to exist.
- Use Google as the only human sign-in method. Remove email/password, email verification, and password reset from the new product.
- Treat this as a fresh launch: do not migrate Postgres data. Rebuild full feature parity otherwise, including workspaces, invites, posts, public/blog API keys, media uploads, and any remaining notification flows.

## Key Changes
- Frontend:
  - Replace the Vite SPA in `frontend/` with a product Next.js app.
  - Preserve current user-facing routes where possible: `/workspaces`, `/dashboard/[workspaceSlug]/*`, `/profile`, `/accept-invite`.
  - Replace auth pages with Google sign-in entry points and invite/onboarding screens. Remove `/login`, `/register`, `/verify`, `/forgot-password`, and `/reset` as product flows.
  - Use Server Components by default and keep client components only for editor/UI-heavy interactions.

- Auth and identity:
  - Implement Convex-native auth with Google as the sole provider.
  - Base the Convex schema on `...authTables` and extend it with product-specific tables instead of recreating the current custom email/password auth schema.
  - User identity is keyed by Google email.
  - If a Google sign-in email matches an existing user record in the new system, auto-link to that user.
  - Workspace invites remain email-based, but acceptance requires the signed-in Google email to exactly match the invited email.
  - Remove password hashes, verification tokens, reset-token flows, and all UI/routes related to email/password auth.
  - Keep session and authorization enforcement inside Convex so workspace/member/owner rules apply consistently across app and Elysia routes.

- Backend and HTTP boundaries:
  - Remove the standalone `backend/` service from the target architecture.
  - Mount Elysia inside the Next app under `/api` and keep it only for:
    - public/blog API routes
    - R2 upload presign/confirm routes
    - webhook/callback-style endpoints if needed
  - Internal admin/product data flows should use Convex directly, not internal REST.

- Data model:
  - Replace Drizzle/Postgres with Convex schema composed of:
    - Convex Auth tables via `...authTables`
    - Product tables for:
      - `workspaces`
      - `workspaceMembers`
      - `workspaceInvitations`
      - `authors`
      - `categories`
      - `tags`
      - `posts`
      - `postBodies`
      - `postTags`
      - `workspaceApiKeys`
      - `media`
      - `emailRateLimits`
  - Do not recreate legacy password, verification-link, or password-reset tables in Convex.
  - Keep posts metadata and post body content separated for query efficiency.
  - Keep R2 as object storage and move media metadata to Convex.
  - Keep `thumbhashBase64` and `aspectRatio` only if preserving the current image placeholder UX; otherwise remove those fields and simplify media rendering.

## Migration Phases
1. Foundation
- Create the new product Next.js app and Convex workspace alongside the legacy code.
- Add shared env handling for Next, Convex, Google auth, Resend, and R2.
- Define route map, layout tree, auth boundary strategy, and Convex client wiring.
- Leave `docs/` untouched.

2. Identity and authorization
- Implement Google-only authentication in Convex.
- Build user bootstrap, session persistence, sign-in/sign-out, protected-route handling, and profile identity mapping.
- Rebuild invite flows so invite email must match the signed-in Google account.
- Rebuild workspace role enforcement for owner/admin/member permissions.

3. Convex domain rewrite
- Port the current CMS domain into Convex schema, indexes, queries, mutations, and actions:
  - workspaces and members
  - authors/categories/tags
  - posts and editor content
  - media metadata
  - public API keys
  - dashboard aggregates
- Start the schema from Convex Auth `authTables`, then layer product tables and authorization rules on top.
- Recreate data validations and authorization checks at the Convex function boundary.

4. Next.js app port
- Port the current UI route by route, preserving feature coverage.
- Replace `frontend/src/api/*` and most React Query hooks with Convex queries/mutations.
- Rebuild dashboard, workspace management, taxonomy screens, member management, editor flows, API key management, and profile surfaces.
- Keep editor-related code split and lazily loaded.

5. Elysia HTTP layer
- Rebuild the public/blog API in Elysia and keep equivalent route capability under `/api/public/v1/...`.
- Rebuild media HTTP flows:
  - presign upload to R2
  - confirm upload
  - trigger thumbhash processing
- Do not preserve long-term internal admin REST compatibility.

6. Async jobs and integrations
- Remove Resend from auth entirely.
- Keep an email provider only for workspace invitation delivery and any later product notifications. Resend can stay for that role, but it is no longer a required auth dependency.
- Remove verification and password-reset email templates and sending logic.
- Replace Azure Functions thumbhash generation with a Convex action or queued server-side job only if preserving the current media placeholder UX.
- If thumbhash is dropped, remove the generation pipeline and simplify the media schema and image components accordingly.
- Keep key/secret redaction in logs.

7. Launch and retirement
- Seed the new environment only with bootstrap data required for launch.
- Launch the new stack without importing Postgres data.
- After acceptance, remove legacy `frontend/`, `backend/`, and `functions/` from the runtime path, then delete them in cleanup.

## Public APIs And Interfaces
- Preserve public/blog HTTP capability in Elysia, including API-key-protected routes.
- Internal app data access shifts to Convex-generated types and hooks.
- Keep workspace slug semantics, role semantics, invite-token semantics, media object identity, and public API key behavior.
- Remove public interfaces related to password login, email verification, and password reset.

## Test Plan
- Auth:
  - Google sign-in success/failure
  - session persistence across reloads
  - sign-out
  - protected route redirects
  - existing-user email auto-link behavior
- Invites and authorization:
  - invite send
  - accept invite with matching Google email
  - reject invite with non-matching Google email
  - owner/admin/member permission enforcement
  - leave workspace, revoke invite, update member role
- CMS:
  - create/update/delete authors, categories, tags
  - create/update/delete posts
  - editor save/load with large content payloads
  - dashboard aggregates correctness
- Media:
  - presign upload
  - confirm upload
  - thumbhash generation and metadata update only if that UX is retained
  - delete permissions by role/uploader
- Public API:
  - workspace metadata
  - published post list/detail
  - category/tag/author endpoints
  - invalid/revoked key handling
- App:
  - route parity for all retained screens
  - SSR/client hydration sanity
  - bundle checks for editor and dashboard routes

## Assumptions And Defaults
- Google is the only human sign-in method in the new app.
- Email/password, email verification, and password reset are fully removed.
- Convex Auth is implemented using `...authTables` plus product-specific tables, not a custom recreation of the old auth schema.
- Invite acceptance requires the signed-in Google email to match the invited email.
- If a Google email matches an existing user record in the new system, the app reuses that user automatically.
- No Postgres-to-Convex migration will be performed.
- The new stack ships as one app: Next.js frontend plus embedded Elysia HTTP layer.
- `docs/` stays separate and out of scope.
- Full feature parity is required apart from the intentional auth simplification.
- Resend is optional and only needed if invite/notification emails remain email-based.
- Thumbhash is unrelated to auth and should only be kept if preserving the current media preview UX.

## Public API Host: `api.vinecms.online`

### Summary
- Use `api.vinecms.online` as the dedicated public-read API host.
- Keep the current public URL shape unchanged: `/api/public/v1/{API_KEY}/...`.
- Serve that host from the same Next.js deployment as the main app rather than creating a separate service.
- Keep auth and app traffic off this host. Google OAuth and Convex auth callbacks stay on the app and Convex auth hosts, not `api.vinecms.online`.
- Implement the public API in the existing Elysia layer behind `app/api/[[...slug]]/route.ts`, backed by Convex queries.

### Implementation Changes
- Attach `api.vinecms.online` as an additional custom domain on the same deployment that serves the Next app.
- Add DNS for `api.vinecms.online` to that deployment target.
- Route by `Host` header:
  - `api.vinecms.online` serves only the public API surface.
  - the main app domain continues serving the product UI and docs.
- Reject non-public routes on `api.vinecms.online` with `404`.
- Do not move auth onto `api.vinecms.online`; keep Convex auth callback URLs unchanged.
- Expand `app/api/[[...slug]]/route.ts` from scaffold to the real Elysia public API.
- Preserve these endpoints under `https://api.vinecms.online/api/public/v1/...`:
  - `GET /status`
  - `GET /{API_KEY}/posts`
  - `GET /{API_KEY}/posts/{postSlug}`
  - `GET /{API_KEY}/authors`
  - `GET /{API_KEY}/categories`
  - `GET /{API_KEY}/tags`
  - `GET /{API_KEY}/stats`
- Implement API-key auth in Elysia by hashing the path API key with the same SHA-256 logic used at key creation time and resolving `workspaceApiKeys.hashedKey`.
- Update `lastUsedAt` and optionally `lastUsedIp` on successful key use.
- Back the endpoints with dedicated Convex public-read queries rather than reusing dashboard-oriented queries directly.
- Keep documented response shapes stable, with post filters `limit`, `offset`, `category`, `tags`, and `author`.
- Public reads must only return published and visible content.
- Return JSON errors with proper status codes: `400`, `401`, `404`, `429`, and `500`.
- Enable `GET`-only CORS for the public API host.
- Add lightweight rate limiting per API key or IP.
- Keep API keys path-based for compatibility.
- Update all docs and examples to use `api.vinecms.online`.

### Public API Test Plan
- `api.vinecms.online/api/public/v1/status` works.
- Non-public routes on `api.vinecms.online` return `404`.
- Main app domain still serves UI normally.
- Valid key returns workspace data; invalid or deleted key returns `401`.
- Post list only includes published and visible posts.
- Post detail returns full post content.
- Filters and pagination match docs.
- Authors, categories, tags, and stats stay workspace-scoped.
- Browser `GET` requests succeed with CORS.
- `lastUsedAt` updates on successful requests.
- Rate-limited requests return `429`.

### Public API Assumptions
- `api.vinecms.online` is the correct target domain.
- The API host is public-read only.
- The path shape remains `/api/public/v1/...`.
- The same Next deployment serves both the app and API host.
- Auth stays on the existing app and Convex auth hosts.
- Public API data is served through Elysia plus Convex queries, not Convex HTTP actions.
