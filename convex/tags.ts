/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireWorkspaceMembership } from './lib/workspace';

export const list = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const tags = await ctx.db
      .query('tags')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    return tags
      .map((tag) => ({
        workspaceId: tag.workspaceId,
        name: tag.name,
        slug: tag.slug,
        createdAt: new Date(tag.createdAt).toISOString(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    workspaceSlug: v.string(),
    data: v.object({
      name: v.string(),
      slug: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const slug = args.data.slug.trim();
    const duplicate = await ctx.db
      .query('tags')
      .withIndex('by_workspace_id_and_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('slug', slug),
      )
      .unique();

    if (duplicate) {
      throw new Error('Tag slug already exists in this workspace');
    }

    await ctx.db.insert('tags', {
      workspaceId: workspace._id,
      name: args.data.name.trim(),
      slug,
      createdAt: Date.now(),
    });

    return {
      workspaceId: workspace._id,
      name: args.data.name.trim(),
      slug,
      createdAt: new Date().toISOString(),
    };
  },
});

export const update = mutation({
  args: {
    workspaceSlug: v.string(),
    tagSlug: v.string(),
    data: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const tag = await ctx.db
      .query('tags')
      .withIndex('by_workspace_id_and_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('slug', args.tagSlug),
      )
      .unique();

    if (!tag) {
      throw new Error('Tag not found');
    }

    const nextSlug = args.data.slug?.trim();
    if (nextSlug && nextSlug !== args.tagSlug) {
      const duplicate = await ctx.db
        .query('tags')
        .withIndex('by_workspace_id_and_slug', (q: any) =>
          q.eq('workspaceId', workspace._id).eq('slug', nextSlug),
        )
        .unique();

      if (duplicate) {
        throw new Error('Tag slug already exists in this workspace');
      }
    }

    await ctx.db.patch(tag._id, {
      ...(args.data.name !== undefined ? { name: args.data.name.trim() } : {}),
      ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
    });

    if (nextSlug && nextSlug !== args.tagSlug) {
      const postTags = await ctx.db
        .query('postTags')
        .withIndex('by_workspace_id_and_tag_slug', (q: any) =>
          q.eq('workspaceId', workspace._id).eq('tagSlug', args.tagSlug),
        )
        .collect();

      for (const postTag of postTags) {
        await ctx.db.patch(postTag._id, { tagSlug: nextSlug });
      }
    }

    const updated = await ctx.db.get(tag._id);
    if (!updated) {
      throw new Error('Tag not found');
    }

    return {
      workspaceId: updated.workspaceId,
      name: updated.name,
      slug: updated.slug,
      createdAt: new Date(updated.createdAt).toISOString(),
    };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    tagSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const tag = await ctx.db
      .query('tags')
      .withIndex('by_workspace_id_and_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('slug', args.tagSlug),
      )
      .unique();

    if (!tag) {
      throw new Error('Tag not found');
    }

    const postTags = await ctx.db
      .query('postTags')
      .withIndex('by_workspace_id_and_tag_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('tagSlug', args.tagSlug),
      )
      .collect();

    for (const postTag of postTags) {
      await ctx.db.delete(postTag._id);
    }

    await ctx.db.delete(tag._id);
    return { success: true };
  },
});
