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
    const categories = await ctx.db
      .query('categories')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    return categories
      .map((category) => ({
        id: category._id,
        name: category.name,
        slug: category.slug,
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
      .query('categories')
      .withIndex('by_workspace_id_and_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('slug', slug),
      )
      .unique();

    if (duplicate) {
      throw new Error('Category slug already exists in this workspace');
    }

    const categoryId = await ctx.db.insert('categories', {
      workspaceId: workspace._id,
      name: args.data.name.trim(),
      slug,
      createdAt: Date.now(),
    });

    const category = await ctx.db.get(categoryId);
    if (!category) {
      throw new Error('Failed to create category');
    }

    return {
      id: category._id,
      name: category.name,
      slug: category.slug,
    };
  },
});

export const update = mutation({
  args: {
    workspaceSlug: v.string(),
    categorySlug: v.string(),
    data: v.object({
      name: v.optional(v.string()),
      slug: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const category = await ctx.db
      .query('categories')
      .withIndex('by_workspace_id_and_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('slug', args.categorySlug),
      )
      .unique();

    if (!category) {
      throw new Error('Category not found');
    }

    const nextSlug = args.data.slug?.trim();
    if (nextSlug && nextSlug !== args.categorySlug) {
      const duplicate = await ctx.db
        .query('categories')
        .withIndex('by_workspace_id_and_slug', (q: any) =>
          q.eq('workspaceId', workspace._id).eq('slug', nextSlug),
        )
        .unique();

      if (duplicate) {
        throw new Error('Category slug already exists in this workspace');
      }
    }

    await ctx.db.patch(category._id, {
      ...(args.data.name !== undefined ? { name: args.data.name.trim() } : {}),
      ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
    });

    if (nextSlug && nextSlug !== args.categorySlug) {
      const posts = await ctx.db
        .query('posts')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect();

      for (const post of posts) {
        if (post.categorySlug === args.categorySlug) {
          await ctx.db.patch(post._id, { categorySlug: nextSlug });
        }
      }
    }

    const updated = await ctx.db.get(category._id);
    if (!updated) {
      throw new Error('Category not found');
    }

    return {
      id: updated._id,
      name: updated.name,
      slug: updated.slug,
    };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    categorySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const category = await ctx.db
      .query('categories')
      .withIndex('by_workspace_id_and_slug', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('slug', args.categorySlug),
      )
      .unique();

    if (!category) {
      throw new Error('Category not found');
    }

    const posts = await ctx.db
      .query('posts')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    for (const post of posts) {
      if (post.categorySlug === args.categorySlug) {
        await ctx.db.patch(post._id, { categorySlug: undefined });
      }
    }

    await ctx.db.delete(category._id);
    return { success: true };
  },
});
