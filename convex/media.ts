/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { canManageRole, requireWorkspaceMembership } from './lib/workspace';

function toResponse(record: any) {
  return {
    id: record._id,
    workspaceId: record.workspaceId,
    uploadedBy: record.uploadedByUserId,
    filename: record.filename,
    contentType: record.contentType,
    size: record.size,
    r2Key: record.r2Key,
    publicUrl: record.publicUrl,
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

    return media
      .map(toResponse)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
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
    const publicUrl = await ctx.storage.getUrl(args.data.storageId);

    if (!publicUrl) {
      throw new Error('Uploaded file could not be resolved');
    }

    const mediaId = await ctx.db.insert('media', {
      workspaceId: workspace._id,
      uploadedByUserId: userId,
      filename: args.data.filename.trim(),
      contentType: args.data.contentType,
      size: args.data.size,
      r2Key: String(args.data.storageId),
      publicUrl,
      storageId: args.data.storageId,
      createdAt: Date.now(),
      aspectRatio: args.data.aspectRatio,
    });

    const media = await ctx.db.get(mediaId);
    if (!media) {
      throw new Error('Failed to save media');
    }

    return toResponse(media);
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

    if (media.storageId) {
      await ctx.storage.delete(media.storageId);
    }

    await ctx.db.delete(media._id);
    return { success: true };
  },
});
