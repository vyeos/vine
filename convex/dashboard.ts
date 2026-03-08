/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuthUserId } from '@convex-dev/auth/server';
import { query } from './_generated/server';
import { v } from 'convex/values';

function formatShortDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
  }).format(new Date(timestamp));
}

async function requireWorkspace(ctx: any, workspaceSlug: string) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    return null;
  }

  const workspace = await ctx.db
    .query('workspaces')
    .withIndex('by_slug', (q: any) => q.eq('slug', workspaceSlug))
    .unique();

  if (!workspace) {
    return null;
  }

  const membership = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_id_and_user_id', (q: any) =>
      q.eq('workspaceId', workspace._id).eq('userId', userId),
    )
    .unique();

  if (!membership) {
    return null;
  }

  return workspace;
}

export const stats = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await requireWorkspace(ctx, args.workspaceSlug);

    if (!workspace) {
      return null;
    }

    const [posts, authors, categories, tags] = await Promise.all([
      ctx.db
        .query('posts')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('authors')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('categories')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('tags')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
    ]);

    const recentPosts = posts
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map((post) => ({
        id: post._id,
        slug: post.slug,
        title: post.title,
        status: post.status,
        publishedAt: post.publishedAt
          ? formatShortDate(post.publishedAt)
          : 'Unpublished',
        excerpt: post.excerpt,
      }));

    return {
      workspaceName: workspace.name,
      stats: [
        { label: 'Posts', value: posts.length },
        { label: 'Authors', value: authors.length },
        { label: 'Categories', value: categories.length },
        { label: 'Tags', value: tags.length },
      ],
      recentPosts,
    };
  },
});

export const heatmap = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await requireWorkspace(ctx, args.workspaceSlug);

    if (!workspace) {
      return null;
    }

    const [posts, authors, categories, tags] = await Promise.all([
      ctx.db
        .query('posts')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('authors')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('categories')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('tags')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
    ]);

    const now = new Date();
    const days = 15;
    const points = Array.from({ length: days }, (_, index) => {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(now.getDate() - (days - index - 1));
      return {
        key: day.getTime(),
        day: formatShortDate(day.getTime()),
        activity: 0,
        posts: 0,
        authors: 0,
        categories: 0,
        tags: 0,
      };
    });

    const pointMap = new Map(points.map((point) => [point.key, point]));

    const increment = (timestamp: number, field: 'posts' | 'authors' | 'categories' | 'tags') => {
      const day = new Date(timestamp);
      day.setHours(0, 0, 0, 0);
      const point = pointMap.get(day.getTime());

      if (!point) {
        return;
      }

      point[field] += 1;
      point.activity += 1;
    };

    for (const post of posts) increment(post.createdAt, 'posts');
    for (const author of authors) increment(author.createdAt, 'authors');
    for (const category of categories) increment(category.createdAt, 'categories');
    for (const tag of tags) increment(tag.createdAt, 'tags');

    return {
      heatmap: points,
    };
  },
});
