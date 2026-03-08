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
    const authors = await ctx.db
      .query('authors')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    return authors
      .map((author) => ({
        id: author._id,
        name: author.name,
        email: author.email,
        about: author.about ?? '',
        socialLinks: (author.socialLinks as Record<string, string> | undefined) ?? undefined,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    workspaceSlug: v.string(),
    data: v.object({
      name: v.string(),
      email: v.string(),
      about: v.optional(v.string()),
      socialLinks: v.optional(v.record(v.string(), v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const authorId = await ctx.db.insert('authors', {
      workspaceId: workspace._id,
      name: args.data.name.trim(),
      email: args.data.email.trim(),
      about: args.data.about?.trim() ?? '',
      socialLinks: args.data.socialLinks,
      createdAt: Date.now(),
    });

    const author = await ctx.db.get(authorId);
    if (!author) {
      throw new Error('Failed to create author');
    }

    return {
      id: author._id,
      name: author.name,
      email: author.email,
      about: author.about ?? '',
      socialLinks: (author.socialLinks as Record<string, string> | undefined) ?? undefined,
    };
  },
});

export const update = mutation({
  args: {
    workspaceSlug: v.string(),
    authorId: v.id('authors'),
    data: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      about: v.optional(v.string()),
      socialLinks: v.optional(v.record(v.string(), v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const author = await ctx.db.get(args.authorId);

    if (!author || author.workspaceId !== workspace._id) {
      throw new Error('Author not found');
    }

    await ctx.db.patch(author._id, {
      ...(args.data.name !== undefined ? { name: args.data.name.trim() } : {}),
      ...(args.data.email !== undefined ? { email: args.data.email.trim() } : {}),
      ...(args.data.about !== undefined ? { about: args.data.about.trim() } : {}),
      ...(args.data.socialLinks !== undefined ? { socialLinks: args.data.socialLinks } : {}),
    });

    const updated = await ctx.db.get(author._id);
    if (!updated) {
      throw new Error('Author not found');
    }

    return {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      about: updated.about ?? '',
      socialLinks: (updated.socialLinks as Record<string, string> | undefined) ?? undefined,
    };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    authorId: v.id('authors'),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const author = await ctx.db.get(args.authorId);

    if (!author || author.workspaceId !== workspace._id) {
      throw new Error('Author not found');
    }

    const posts = await ctx.db
      .query('posts')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    for (const post of posts) {
      if (post.authorId === author._id) {
        await ctx.db.patch(post._id, { authorId: undefined });
      }
    }

    await ctx.db.delete(author._id);
    return { success: true };
  },
});
