/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import {
  canAssignRole,
  canManageRole,
  countWorkspaceOwners,
  requireWorkspaceMembership,
  type MemberRole,
} from './lib/workspace';

function randomToken(length = 32) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

async function hydrateMember(ctx: any, membership: any) {
  const user = await ctx.db.get(membership.userId);
  return {
    userId: membership.userId,
    name: user?.name ?? 'Unnamed User',
    email: user?.email ?? '',
    avatar: user?.image,
    role: membership.role,
    joinedAt: new Date(membership.joinedAt).toISOString(),
  };
}

export const list = query({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);

    const [memberships, invitations] = await Promise.all([
      ctx.db
        .query('workspaceMembers')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
      ctx.db
        .query('workspaceInvitations')
        .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
        .collect(),
    ]);

    const members = await Promise.all(memberships.map((membership) => hydrateMember(ctx, membership)));

    return {
      members: members.sort((a, b) => a.name.localeCompare(b.name)),
      invitations: invitations
        .filter((invitation) => invitation.status === 'pending')
        .map((invitation) => ({
          id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          invitedAt: new Date(invitation.invitedAt).toISOString(),
        }))
        .sort((a, b) => +new Date(b.invitedAt) - +new Date(a.invitedAt)),
    };
  },
});

export const invite = mutation({
  args: {
    workspaceSlug: v.string(),
    data: v.object({
      email: v.string(),
      role: v.union(v.literal('admin'), v.literal('member')),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace, userId, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);

    if (!canAssignRole(membership.role, args.data.role as MemberRole)) {
      throw new Error('You do not have permission to invite a member with this role');
    }

    const normalizedEmail = args.data.email.trim().toLowerCase();

    const users = await ctx.db.query('users').collect();
    const existingUser = users.find((user: any) => user.email?.toLowerCase() === normalizedEmail) ?? null;

    if (existingUser) {
      const existingMembership = await ctx.db
        .query('workspaceMembers')
        .withIndex('by_workspace_id_and_user_id', (q: any) =>
          q.eq('workspaceId', workspace._id).eq('userId', existingUser._id),
        )
        .unique();

      if (existingMembership) {
        throw new Error('This user is already a member of the workspace');
      }
    }

    const invitations = await ctx.db
      .query('workspaceInvitations')
      .withIndex('by_workspace_id', (q: any) => q.eq('workspaceId', workspace._id))
      .collect();

    const duplicate = invitations.find(
      (invitation: any) =>
        invitation.email.toLowerCase() === normalizedEmail && invitation.status === 'pending',
    );

    if (duplicate) {
      throw new Error('A pending invitation already exists for this email');
    }

    const invitationId = await ctx.db.insert('workspaceInvitations', {
      workspaceId: workspace._id,
      email: normalizedEmail,
      role: args.data.role,
      invitedByUserId: userId,
      token: randomToken(),
      status: 'pending',
      invitedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    return {
      id: invitationId,
      email: normalizedEmail,
      role: args.data.role,
      invitedAt: new Date().toISOString(),
    };
  },
});

export const updateRole = mutation({
  args: {
    workspaceSlug: v.string(),
    userId: v.id('users'),
    data: v.object({
      role: v.union(v.literal('owner'), v.literal('admin'), v.literal('member')),
    }),
  },
  handler: async (ctx, args) => {
    const { workspace, userId, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const target = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_workspace_id_and_user_id', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('userId', args.userId),
      )
      .unique();

    if (!target) {
      throw new Error('Member not found');
    }

    if (String(userId) === String(args.userId)) {
      throw new Error('You cannot change your own role');
    }

    if (!canManageRole(membership.role, target.role) || !canAssignRole(membership.role, args.data.role)) {
      throw new Error('You do not have permission to update this member');
    }

    if (target.role === 'owner' && args.data.role !== 'owner') {
      const owners = await countWorkspaceOwners(ctx, workspace._id);
      if (owners <= 1) {
        throw new Error('A workspace must have at least one owner');
      }
    }

    await ctx.db.patch(target._id, { role: args.data.role });
    const updated = await ctx.db.get(target._id);
    return await hydrateMember(ctx, updated);
  },
});

export const remove = mutation({
  args: {
    workspaceSlug: v.string(),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const { workspace, userId, membership } = result;
    const target = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_workspace_id_and_user_id', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('userId', args.userId),
      )
      .unique();

    if (!target) {
      throw new Error('Member not found');
    }

    if (String(userId) === String(args.userId)) {
      throw new Error('You cannot remove yourself');
    }

    if (!canManageRole(membership.role, target.role)) {
      throw new Error('You do not have permission to remove this member');
    }

    if (target.role === 'owner') {
      const owners = await countWorkspaceOwners(ctx, workspace._id);
      if (owners <= 1) {
        throw new Error('A workspace must have at least one owner');
      }
    }

    await ctx.db.delete(target._id);
    return { success: true };
  },
});

export const revokeInvitation = mutation({
  args: {
    workspaceSlug: v.string(),
    invitationId: v.id('workspaceInvitations'),
  },
  handler: async (ctx, args) => {
    const { workspace, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const invitation = await ctx.db.get(args.invitationId);

    if (!invitation || invitation.workspaceId !== workspace._id) {
      throw new Error('Invitation not found');
    }

    if (!canManageRole(membership.role, invitation.role)) {
      throw new Error('You do not have permission to revoke this invitation');
    }

    await ctx.db.patch(invitation._id, { status: 'revoked' });
    return { success: true };
  },
});

export const leave = mutation({
  args: {
    workspaceSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const { workspace, userId, membership } = await requireWorkspaceMembership(ctx, args.workspaceSlug);

    if (membership.role === 'owner') {
      const owners = await countWorkspaceOwners(ctx, workspace._id);
      if (owners <= 1) {
        throw new Error('Transfer ownership before leaving the workspace');
      }
    }

    const membershipRecord = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_workspace_id_and_user_id', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('userId', userId),
      )
      .unique();

    if (!membershipRecord) {
      throw new Error('Membership not found');
    }

    await ctx.db.delete(membershipRecord._id);
    return { success: true };
  },
});
