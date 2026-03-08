/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

async function requireUserId(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new Error('Authentication required');
  }

  return userId;
}

async function getMembershipBySlug(
  ctx: any,
  userId: string,
  workspaceSlug: string,
) {
  const workspace = await ctx.db
    .query('workspaces')
    .withIndex('by_slug', (q: any) => q.eq('slug', workspaceSlug))
    .unique();

  if (!workspace) {
    return { workspace: null, membership: null };
  }

  const membership = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_id_and_user_id', (q: any) =>
      q.eq('workspaceId', workspace._id).eq('userId', userId),
    )
    .unique();

  return { workspace, membership };
}

async function deleteWorkspaceTree(ctx: any, workspaceId: string) {
  const members = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const invitations = await ctx.db
    .query('workspaceInvitations')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const authors = await ctx.db
    .query('authors')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const categories = await ctx.db
    .query('categories')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const tags = await ctx.db
    .query('tags')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const posts = await ctx.db
    .query('posts')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const apiKeys = await ctx.db
    .query('workspaceApiKeys')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();
  const media = await ctx.db
    .query('media')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();

  for (const post of posts) {
    const body = await ctx.db
      .query('postBodies')
      .withIndex('by_post_id', (q: any) => q.eq('postId', post._id))
      .unique();
    const postTags = await ctx.db
      .query('postTags')
      .withIndex('by_post_id', (q: any) => q.eq('postId', post._id))
      .collect();

    for (const postTag of postTags) {
      await ctx.db.delete(postTag._id);
    }

    if (body) {
      await ctx.db.delete(body._id);
    }

    await ctx.db.delete(post._id);
  }

  for (const member of members) await ctx.db.delete(member._id);
  for (const invitation of invitations) await ctx.db.delete(invitation._id);
  for (const author of authors) await ctx.db.delete(author._id);
  for (const category of categories) await ctx.db.delete(category._id);
  for (const tag of tags) await ctx.db.delete(tag._id);
  for (const apiKey of apiKeys) await ctx.db.delete(apiKey._id);
  for (const asset of media) await ctx.db.delete(asset._id);

  await ctx.db.delete(workspaceId);
}

export const listForViewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .collect();

    const records = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);

        if (!workspace) {
          return null;
        }

        return {
          id: workspace._id,
          name: workspace.name,
          slug: workspace.slug,
          createdAt: new Date(workspace.createdAt).toISOString(),
          role: membership.role,
          joinedAt: new Date(membership.joinedAt).toISOString(),
        };
      }),
    );

    return records
      .filter((record): record is NonNullable<typeof record> => record !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const verifyForViewer = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const { workspace, membership } = await getMembershipBySlug(
      ctx,
      userId,
      args.workspaceSlug,
    );

    if (!workspace || !membership) {
      return null;
    }

    return {
      id: workspace._id,
      name: workspace.name,
      slug: workspace.slug,
      createdAt: new Date(workspace.createdAt).toISOString(),
      role: membership.role,
    };
  },
});

export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('workspaces')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    return {
      available: existing === null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const trimmedName = args.name.trim();
    const trimmedSlug = args.slug.trim();
    const existing = await ctx.db
      .query('workspaces')
      .withIndex('by_slug', (q) => q.eq('slug', trimmedSlug))
      .unique();

    if (existing) {
      throw new Error('Workspace slug already exists');
    }

    const now = Date.now();
    const workspaceId = await ctx.db.insert('workspaces', {
      name: trimmedName,
      slug: trimmedSlug,
      ownerUserId: userId,
      createdAt: now,
    });

    await ctx.db.insert('workspaceMembers', {
      workspaceId,
      userId,
      role: 'owner',
      joinedAt: now,
    });

    return {
      id: workspaceId,
      slug: trimmedSlug,
    };
  },
});

export const update = mutation({
  args: {
    workspaceSlug: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const { workspace, membership } = await getMembershipBySlug(
      ctx,
      userId,
      args.workspaceSlug,
    );

    if (!workspace || !membership) {
      throw new Error('Workspace not found');
    }

    if (membership.role !== 'owner') {
      throw new Error('Only workspace owners can update workspace settings');
    }

    await ctx.db.patch(workspace._id, {
      name: args.name.trim(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const { workspace, membership } = await getMembershipBySlug(
      ctx,
      userId,
      args.workspaceSlug,
    );

    if (!workspace || !membership) {
      throw new Error('Workspace not found');
    }

    if (membership.role !== 'owner') {
      throw new Error('Only workspace owners can delete a workspace');
    }

    await deleteWorkspaceTree(ctx, workspace._id);

    return { success: true };
  },
});
