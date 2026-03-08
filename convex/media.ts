/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { canManageRole, requireWorkspaceMembership } from './lib/workspace';

async function resolveMediaUrl(ctx: any, record: any) {
  const storageUrl = await ctx.storage.getUrl(record.storageId);
  if (storageUrl) {
    return storageUrl;
  }
  return null;
}

async function toResponse(ctx: any, record: any) {
  const url = await resolveMediaUrl(ctx, record);
  if (!url) {
    return null;
  }

  return {
    id: record._id,
    workspaceId: record.workspaceId,
    uploadedBy: record.uploadedByUserId,
    filename: record.filename,
    contentType: record.contentType,
    size: record.size,
    storageId: record.storageId,
    url,
    thumbhashBase64: record.thumbhashBase64 ?? null,
    aspectRatio: record.aspectRatio ?? null,
    createdAt: new Date(record.createdAt).toISOString(),
  };
}

export const list = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const media = await ctx.db
      .query('media')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    const resolvedMedia = await Promise.all(
      media
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((record) => toResponse(ctx, record)),
    );

    return resolvedMedia.filter((record) => record !== null);
  },
});

export const generateUploadUrl = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});

export const confirmUpload = mutation({
  args: {
    workspaceSlug: v.string(),
    data: v.object({
      storageId: v.id('_storage'),
      filename: v.string(),
      contentType: v.string(),
      size: v.number(),
      aspectRatio: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace, userId } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const url = await ctx.storage.getUrl(args.data.storageId);

    if (!url) {
      throw new Error('Uploaded file could not be resolved');
    }

    const createdAt = Date.now();
    const mediaId = await ctx.db.insert('media', {
      workspaceId: workspace._id,
      uploadedByUserId: userId,
      filename: args.data.filename.trim(),
      contentType: args.data.contentType,
      size: args.data.size,
      storageId: args.data.storageId,
      createdAt,
      aspectRatio: args.data.aspectRatio,
    });

    return {
      id: mediaId,
      workspaceId: workspace._id,
      uploadedBy: userId,
      filename: args.data.filename.trim(),
      contentType: args.data.contentType,
      size: args.data.size,
      storageId: args.data.storageId,
      url,
      thumbhashBase64: null,
      aspectRatio: args.data.aspectRatio ?? null,
      createdAt: new Date(createdAt).toISOString(),
    };
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    mediaId: v.id('media'),
  },
  handler: async (ctx, args) => {
    const { workspace, userId, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const media = await ctx.db.get(args.mediaId);

    if (!media || media.workspaceId !== workspace._id) {
      throw new Error('Media not found');
    }

    const canDelete = canManageRole(membership.role, 'member') || String(media.uploadedByUserId) === String(userId);
    if (!canDelete) {
      throw new Error('You do not have permission to delete this media');
    }

    await ctx.storage.delete(media.storageId);

    await ctx.db.delete(media._id);
    return { success: true };
  },
});
