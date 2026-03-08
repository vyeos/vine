# Vine

Primary app for the project, built with Next.js, Convex, and Elysia.

## Stack
- Next.js App Router for the frontend and product routes
- Convex for auth, database, file storage, and server functions
- Elysia mounted behind Next route handlers for HTTP-specific APIs
- Bun for package management and scripts

## Repository Layout

```
.
├── web/       # Main application
├── LICENSE
├── README.md
└── plan.md
```

## Quick Start

1. Install dependencies
   ```bash
   cd /Users/vyeos/personal/vine/web
   bun install
   ```
2. Configure environment in `web/.env.local`
3. Start Convex
   ```bash
   cd /Users/vyeos/personal/vine/web
   bunx convex dev
   ```
4. Start Next.js
   ```bash
   cd /Users/vyeos/personal/vine/web
   bun dev
   ```

Or use the root scripts:

```bash
cd /Users/vyeos/personal/vine
bun run convex:dev
bun run dev
```

## Required Environment

Set the application variables in `web/.env.local`.

Typical local values:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
```

Set the required Convex deployment variables as well:
- `SITE_URL=http://localhost:3000` for local dev
- `JWT_PRIVATE_KEY`
- `JWKS`

## Root Scripts

- `bun run dev`
- `bun run build`
- `bun run start`
- `bun run lint`
- `bun run convex:dev`
- `bun run convex:deploy`

## Notes

- The old React/Node/Postgres code has been removed.
- The active application lives under `web/`.
- Docs are now served from the main Next app at `/docs`.

## License

Distributed under the MIT License. See `LICENSE` for details.
