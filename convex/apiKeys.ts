/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireWorkspaceMembership } from './lib/workspace';

function randomBase62(length: number) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

async function sha256(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toResponse(record: any) {
  return {
    id: record._id,
    workspaceId: record.workspaceId,
    description: record.description,
    createdByUserId: record.createdByUserId,
    createdAt: new Date(record.createdAt).toISOString(),
    lastUsedAt: record.lastUsedAt ? new Date(record.lastUsedAt).toISOString() : null,
    lastUsedIp: record.lastUsedIp ?? null,
  };
}

export const list = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const keys = await ctx.db
      .query('workspaceApiKeys')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    return keys
      .map(toResponse)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },
});

export const create = mutation({
  args: {
    workspaceSlug: v.string(),
    data: v.object({
      description: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace, userId, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);

    if (membership.role === 'member') {
      throw new Error('Only workspace owners and admins can create API keys');
    }

    const existingKeys = await ctx.db
      .query('workspaceApiKeys')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    if (existingKeys.length >= 3) {
      throw new Error('Workspace already has 3 API keys');
    }

    const apiKey = `vine-${workspace.slug}-${randomBase62(14)}`;
    const hashedKey = await sha256(apiKey);

    const id = await ctx.db.insert('workspaceApiKeys', {
      workspaceId: workspace._id,
      description: args.data.description.trim(),
      hashedKey,
      createdByUserId: userId,
      createdAt: Date.now(),
    });

    const record = await ctx.db.get(id);
    if (!record) {
      throw new Error('Failed to create API key');
    }

    return {
      apiKey,
      metadata: toResponse(record),
    };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    apiKeyId: v.id('workspaceApiKeys'),
  },
  handler: async (ctx, args) => {
    const { workspace, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);

    if (membership.role === 'member') {
      throw new Error('Only workspace owners and admins can delete API keys');
    }

    const record = await ctx.db.get(args.apiKeyId);
    if (!record || record.workspaceId !== workspace._id) {
      throw new Error('API key not found');
    }

    await ctx.db.delete(record._id);
    return { success: true };
  },
});
