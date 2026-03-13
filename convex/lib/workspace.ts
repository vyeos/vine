/* eslint-disable @typescript-eslint/no-explicit-any */

import { getAuthUserId } from '@convex-dev/auth/server';

export type MemberRole = 'owner' | 'admin' | 'member';

export const ROLE_HIERARCHY: Record<MemberRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

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

  const memberships = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_id_and_user_id', (q: any) =>
      q.eq('workspaceId', workspace._id).eq('userId', userId),
    )
    .collect();

  const membership = memberships.sort((a: any, b: any) => a.joinedAt - b.joinedAt)[0] ?? null;

  if (!membership) {
    throw new Error('You are not a member of this workspace');
  }

  return { userId, workspace, membership };
}

export async function requireWorkspaceRole(
  ctx: any,
  workspaceSlug: string,
  minimumRole: MemberRole,
) {
  const result = await requireWorkspaceMembership(ctx, workspaceSlug);

  if (ROLE_HIERARCHY[result.membership.role as MemberRole] < ROLE_HIERARCHY[minimumRole]) {
    throw new Error('You do not have permission to perform this action');
  }

  return result;
}

export function canManageRole(actingRole: MemberRole, targetRole: MemberRole) {
  return ROLE_HIERARCHY[actingRole] > ROLE_HIERARCHY[targetRole];
}

export function canAssignRole(actingRole: MemberRole, nextRole: MemberRole) {
  return ROLE_HIERARCHY[actingRole] > ROLE_HIERARCHY[nextRole];
}

export async function countWorkspaceOwners(ctx: any, workspaceId: string) {
  const members = await ctx.db
    .query('workspaceMembers')
    .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspaceId))
    .collect();

  return members.filter((member: any) => member.role === 'owner').length;
}
