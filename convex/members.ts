/* eslint-disable @typescript-eslint/no-explicit-any */

import { v } from 'convex/values';
import { action, internalQuery, mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import {
  canAssignRole,
  canManageRole,
  countWorkspaceOwners,
  requireUserId,
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

export const getInvitationEmailPayload = internalQuery({
  args: {
    workspaceSlug: v.string(),
    invitationId: v.id('workspaceInvitations'),
  },
  handler: async (ctx, args) => {
    const { workspace } = await requireWorkspaceMembership(ctx, args.workspaceSlug);
    const invitation = await ctx.db.get(args.invitationId);

    if (!invitation || invitation.workspaceId !== workspace._id) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer pending');
    }

    const inviter = await ctx.db.get(invitation.invitedByUserId);

    return {
      invitationId: invitation._id,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      invitedEmail: invitation.email,
      invitedRole: invitation.role,
      token: invitation.token,
      inviterName: inviter?.name ?? 'A teammate',
      inviterEmail: inviter?.email ?? undefined,
      expiresAt: invitation.expiresAt ?? undefined,
    };
  },
});

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

    const token = randomToken();
    const invitationId = await ctx.db.insert('workspaceInvitations', {
      workspaceId: workspace._id,
      email: normalizedEmail,
      role: args.data.role,
      invitedByUserId: userId,
      token,
      status: 'pending',
      invitedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    });

    return {
      id: invitationId,
      email: normalizedEmail,
      role: args.data.role,
      token,
      invitedAt: new Date().toISOString(),
    };
  },
});

export const acceptInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    const normalizedEmail = user?.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new Error('Your account is missing an email address');
    }

    const invitation = await ctx.db
      .query('workspaceInvitations')
      .withIndex('by_token', (q: any) => q.eq('token', args.token))
      .unique();

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.email.toLowerCase() !== normalizedEmail) {
      throw new Error(`This invitation is for ${invitation.email}`);
    }

    const workspace = await ctx.db.get(invitation.workspaceId);

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const membershipRecords = await ctx.db
      .query('workspaceMembers')
      .withIndex('by_workspace_id_and_user_id', (q: any) =>
        q.eq('workspaceId', workspace._id).eq('userId', userId),
      )
      .collect();

    const sortedMemberships = membershipRecords.sort(
      (a: any, b: any) => a.joinedAt - b.joinedAt,
    );
    const existingMembership = sortedMemberships[0] ?? null;

    if (invitation.status === 'accepted') {
      if (!existingMembership) {
        throw new Error('This invitation has already been used');
      }

      return {
        workspaceSlug: workspace.slug,
        workspaceName: workspace.name,
        role: existingMembership.role,
      };
    }

    if (invitation.status === 'revoked') {
      throw new Error('This invitation has been revoked');
    }

    if (invitation.status === 'expired') {
      throw new Error('This invitation has expired');
    }

    if (invitation.expiresAt && invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: 'expired' });
      throw new Error('This invitation has expired');
    }

    for (const duplicateMembership of sortedMemberships.slice(1)) {
      await ctx.db.delete(duplicateMembership._id);
    }

    if (!existingMembership) {
      await ctx.db.insert('workspaceMembers', {
        workspaceId: workspace._id,
        userId,
        role: invitation.role,
        joinedAt: Date.now(),
      });
    }

    await ctx.db.patch(invitation._id, { status: 'accepted' });

    return {
      workspaceSlug: workspace.slug,
      workspaceName: workspace.name,
      role: existingMembership?.role ?? invitation.role,
    };
  },
});

export const sendInviteEmail = action({
  args: {
    workspaceSlug: v.string(),
    invitationId: v.id('workspaceInvitations'),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Vine <onboarding@resend.dev>';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL is not configured');
    }

    const invitation = await ctx.runQuery(internal.members.getInvitationEmailPayload, args);
    const acceptUrl = new URL(`/accept-invite?token=${encodeURIComponent(invitation.token)}`, appUrl);
    const expiresOn = invitation.expiresAt
      ? new Date(invitation.expiresAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `workspace-invite:${invitation.invitationId}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [invitation.invitedEmail],
        reply_to: invitation.inviterEmail ? [invitation.inviterEmail] : undefined,
        subject: `${invitation.inviterName} invited you to join ${invitation.workspaceName} on Vine`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 560px; margin: 0 auto; padding: 24px;">
            <p style="margin: 0 0 16px;">Hi there,</p>
            <p style="margin: 0 0 16px;">
              <strong>${escapeHtml(invitation.inviterName)}</strong> invited you to join
              <strong>${escapeHtml(invitation.workspaceName)}</strong> on Vine as a
              <strong>${escapeHtml(invitation.invitedRole)}</strong>.
            </p>
            <p style="margin: 0 0 24px;">Use the button below to accept the invitation with the same email address this invite was sent to.</p>
            <p style="margin: 0 0 24px;">
              <a href="${acceptUrl.toString()}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600;">
                Accept invitation
              </a>
            </p>
            <p style="margin: 0 0 12px; font-size: 14px; color: #4b5563;">If the button does not work, use this link:</p>
            <p style="margin: 0 0 16px; font-size: 14px; word-break: break-all;">
              <a href="${acceptUrl.toString()}" style="color: #2563eb;">${acceptUrl.toString()}</a>
            </p>
            ${
              expiresOn
                ? `<p style="margin: 0; font-size: 14px; color: #6b7280;">This invite expires on ${escapeHtml(expiresOn)}.</p>`
                : ''
            }
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend failed to send invite email: ${errorText}`);
    }

    const result = (await response.json()) as { id?: string };

    return {
      success: true,
      emailId: result.id,
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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
