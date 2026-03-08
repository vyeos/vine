import { Elysia } from 'elysia';

const api = new Elysia({ prefix: '/api' })
  .get('/health', () => ({
    ok: true,
    service: 'web',
    runtime: 'nextjs+elysia',
  }))
  .get('/public/v1/status', () => ({
    ok: true,
    message: 'Public API scaffold is mounted. Route parity work is pending.',
  }));

const handle = api.handle;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}

export function PATCH(request: Request) {
  return handle(request);
}

export function DELETE(request: Request) {
  return handle(request);
}
