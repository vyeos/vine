/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getWorkspaceBySlug } from './lib/workspace';

async function sha256(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function validateApiKey(ctx: any, workspaceSlug: string, apiKey: string) {
  const workspace = await getWorkspaceBySlug(ctx, workspaceSlug.trim());
  if (!workspace) {
    return null;
  }

  const hashedKey = await sha256(apiKey.trim());
  const record = await ctx.db
    .query('workspaceApiKeys')
    .withIndex('by_hashed_key', (q: any) => q.eq('hashedKey', hashedKey))
    .unique();

  if (!record || record.workspaceId !== workspace._id) {
    return null;
  }

  return { workspace, apiKeyRecord: record };
}

function isPublicPost(post: any) {
  return post.visible === true && post.status === 'published';
}

async function getPublicPostBySlug(ctx: any, workspaceId: string, postSlug: string) {
  return await ctx.db
    .query('posts')
    .withIndex('by_workspace_id_and_slug', (q: any) =>
      q.eq('workspaceId', workspaceId).eq('slug', postSlug),
    )
    .unique();
}

async function getPublicPostListItem(ctx: any, post: any) {
  const [author, category, postTags] = await Promise.all([
    post.authorId ? ctx.db.get(post.authorId) : Promise.resolve(null),
    post.categorySlug
      ? ctx.db
          .query('categories')
          .withIndex('by_workspace_id_and_slug', (q: any) =>
            q.eq('workspaceId', post.workspaceId).eq('slug', post.categorySlug),
          )
          .unique()
      : Promise.resolve(null),
    ctx.db
      .query('postTags')
      .withIndex('by_post_id', (q: any) => q.eq('postId', post._id))
      .collect(),
  ]);

  const tags = await Promise.all(
    postTags.map(async (postTag: any) => {
      const tag = await ctx.db
        .query('tags')
        .withIndex('by_workspace_id_and_tag_slug', (q: any) =>
          q.eq('workspaceId', post.workspaceId).eq('tagSlug', postTag.tagSlug),
        )
        .unique();

      return tag
        ? {
            slug: tag.slug,
            name: tag.name,
          }
        : null;
    }),
  );

  return {
    id: post._id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    updatedAt: new Date(post.updatedAt).toISOString(),
    author: author
      ? {
          id: author._id,
          name: author.name,
        }
      : null,
    category: category
      ? {
          slug: category.slug,
          name: category.name,
        }
      : null,
    tags: tags.filter((tag): tag is NonNullable<typeof tag> => tag !== null),
  };
}

async function getPublicPostDetail(ctx: any, post: any) {
  const [listItem, body] = await Promise.all([
    getPublicPostListItem(ctx, post),
    ctx.db
      .query('postBodies')
      .withIndex('by_post_id', (q: any) => q.eq('postId', post._id))
      .unique(),
  ]);

  return {
    ...listItem,
    contentHtml: body?.contentHtml ?? '',
    contentJson: body?.contentJson ?? null,
  };
}

export const listPosts = query({
  args: {
    workspaceSlug: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const access = await validateApiKey(ctx, args.workspaceSlug, args.apiKey);
    if (!access) {
      return null;
    }

    const posts = await ctx.db
      .query('posts')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', access.workspace._id))
      .collect();

    const publicPosts = posts.filter(isPublicPost);
    const items = await Promise.all(publicPosts.map((post) => getPublicPostListItem(ctx, post)));

    return {
      workspace: {
        id: access.workspace._id,
        name: access.workspace.name,
        slug: access.workspace.slug,
      },
      posts: items.sort((a, b) => {
        const aDate = a.publishedAt ?? a.updatedAt;
        const bDate = b.publishedAt ?? b.updatedAt;
        return +new Date(bDate) - +new Date(aDate);
      }),
    };
  },
});

export const getPost = query({
  args: {
    workspaceSlug: v.string(),
    apiKey: v.string(),
    postSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const access = await validateApiKey(ctx, args.workspaceSlug, args.apiKey);
    if (!access) {
      return null;
    }

    const post = await getPublicPostBySlug(ctx, access.workspace._id, args.postSlug.trim());
    if (!post || !isPublicPost(post)) {
      return {
        workspace: {
          id: access.workspace._id,
          name: access.workspace.name,
          slug: access.workspace.slug,
        },
        post: null,
      };
    }

    return {
      workspace: {
        id: access.workspace._id,
        name: access.workspace.name,
        slug: access.workspace.slug,
      },
      post: await getPublicPostDetail(ctx, post),
    };
  },
});

export const trackApiKeyUsage = mutation({
  args: {
    workspaceSlug: v.string(),
    apiKey: v.string(),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const access = await validateApiKey(ctx, args.workspaceSlug, args.apiKey);
    if (!access) {
      return { success: false };
    }

    await ctx.db.patch(access.apiKeyRecord._id, {
      lastUsedAt: Date.now(),
      lastUsedIp: args.ip?.trim() || undefined,
    });

    return { success: true };
  },
});
