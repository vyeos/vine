/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuthUserId } from '@convex-dev/auth/server';

export async function requireUserId(ctx: Parameters<typeof getAuthUserId>[0]) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new Error('Authentication required');
  }

  return userId;
}

export async function getWorkspaceBySlug(ctx: any, workspaceSlug: string) {
  return await ctx.db
    .query('workspaces')
    .withIndex('by_slug', (q: any) => q.eq('slug', workspaceSlug))
    .unique();
}

export async function requireWorkspaceMembership(ctx: any, workspaceSlug: string) {
  const userId = await requireUserId(ctx);
  const workspace = await getWorkspaceBySlug(ctx, workspaceSlug);

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  const membership = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_id_and_user_id', (q: any) =>
      q.eq('workspaceId', workspace._id).eq('userId', userId),
    )
    .unique();

  if (!membership) {
    throw new Error('You are not a member of this workspace');
  }

  return { userId, workspace, membership };
}
