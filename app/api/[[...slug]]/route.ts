import { Elysia } from 'elysia';
import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { makeFunctionReference } from 'convex/server';

type PublicPostsResponse = {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string | null;
    updatedAt: string;
    author: { id: string; name: string } | null;
    category: { slug: string; name: string } | null;
    tags: Array<{ slug: string; name: string }>;
  }>;
} | null;

type PublicPostResponse = {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string | null;
    updatedAt: string;
    author: { id: string; name: string } | null;
    category: { slug: string; name: string } | null;
    tags: Array<{ slug: string; name: string }>;
    contentHtml: string;
    contentJson: unknown;
  } | null;
} | null;

const listPublicPosts = makeFunctionReference<
  'query',
  { workspaceSlug: string; apiKey: string },
  PublicPostsResponse
>('publicApi:listPosts');

const getPublicPost = makeFunctionReference<
  'query',
  { workspaceSlug: string; apiKey: string; postSlug: string },
  PublicPostResponse
>('publicApi:getPost');

const trackPublicApiKeyUsage = makeFunctionReference<
  'mutation',
  { workspaceSlug: string; apiKey: string; ip?: string },
  { success: boolean }
>('publicApi:trackApiKeyUsage');

function getApiKey(request: Request) {
  const bearer = request.headers.get('authorization');
  if (bearer?.toLowerCase().startsWith('bearer ')) {
    return bearer.slice(7).trim();
  }

  return request.headers.get('x-api-key')?.trim() ?? null;
}

function getWorkspaceSlug(request: Request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get('workspace')?.trim() || searchParams.get('workspaceSlug')?.trim() || null;
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }

  return request.headers.get('x-real-ip')?.trim() ?? undefined;
}

const api = new Elysia({ prefix: '/api' })
  .get('/health', () => ({
    ok: true,
    service: 'web',
    runtime: 'nextjs+elysia',
  }))
  .get('/public/v1/status', () => ({
    ok: true,
    message: 'Public API is available.',
  }))
  .get('/public/v1/posts', async ({ request, set }) => {
    const workspaceSlug = getWorkspaceSlug(request);
    if (!workspaceSlug) {
      set.status = 400;
      return { ok: false, error: 'Missing workspace query parameter' };
    }

    const apiKey = getApiKey(request);
    if (!apiKey) {
      set.status = 401;
      return { ok: false, error: 'Missing API key' };
    }

    const result = await fetchQuery(listPublicPosts, {
      workspaceSlug,
      apiKey,
    });

    if (!result) {
      set.status = 401;
      return { ok: false, error: 'Invalid API key or workspace' };
    }

    await fetchMutation(trackPublicApiKeyUsage, {
      workspaceSlug,
      apiKey,
      ip: getRequestIp(request),
    });

    return {
      ok: true,
      workspace: result.workspace,
      posts: result.posts,
    };
  })
  .get('/public/v1/posts/:postSlug', async ({ params, request, set }) => {
    const workspaceSlug = getWorkspaceSlug(request);
    if (!workspaceSlug) {
      set.status = 400;
      return { ok: false, error: 'Missing workspace query parameter' };
    }

    const apiKey = getApiKey(request);
    if (!apiKey) {
      set.status = 401;
      return { ok: false, error: 'Missing API key' };
    }

    const result = await fetchQuery(getPublicPost, {
      workspaceSlug,
      apiKey,
      postSlug: params.postSlug,
    });

    if (!result) {
      set.status = 401;
      return { ok: false, error: 'Invalid API key or workspace' };
    }

    if (!result.post) {
      set.status = 404;
      return { ok: false, error: 'Post not found' };
    }

    await fetchMutation(trackPublicApiKeyUsage, {
      workspaceSlug,
      apiKey,
      ip: getRequestIp(request),
    });

    return {
      ok: true,
      workspace: result.workspace,
      post: result.post,
    };
  });

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
