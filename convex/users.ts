import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { requireUserId } from './lib/workspace';

const DEFAULT_PREFERENCES = {
  emailInvites: true,
  productUpdates: false,
  publishAlerts: true,
  apiUsageAlerts: true,
};

function getResolvedAvatar(
  providerAvatar: string | undefined,
  avatarMode: 'provider' | 'custom',
  avatarUrl: string | undefined,
) {
  if (avatarMode === 'custom' && avatarUrl) {
    return avatarUrl;
  }

  return providerAvatar;
}

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();
    const avatarMode = profile?.avatarMode ?? 'provider';
    const customAvatarUrl = profile?.avatarUrl;

    return {
      id: user._id,
      name: user.name ?? 'Unnamed User',
      email: user.email ?? '',
      avatar: getResolvedAvatar(user.image, avatarMode, customAvatarUrl),
      providerAvatar: user.image,
      customAvatarUrl,
      avatarMode,
      authProvider: 'google' as const,
    };
  },
});

export const profileOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }

    const [user, profile, preferenceRecord, memberships] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query('userProfiles')
        .withIndex('by_user_id', (q) => q.eq('userId', userId))
        .unique(),
      ctx.db
        .query('userPreferences')
        .withIndex('by_user_id', (q) => q.eq('userId', userId))
        .unique(),
      ctx.db
        .query('workspaceMembers')
        .withIndex('by_user_id', (q) => q.eq('userId', userId))
        .collect(),
    ]);

    if (!user) {
      return null;
    }

    const membershipRecords = (
      await Promise.all(
        memberships.map(async (membership) => {
          const workspace = await ctx.db.get(membership.workspaceId);

          if (!workspace) {
            return null;
          }

          return {
            id: workspace._id,
            name: workspace.name,
            slug: workspace.slug,
            role: membership.role,
            createdAt: new Date(workspace.createdAt).toISOString(),
            joinedAt: new Date(membership.joinedAt).toISOString(),
          };
        }),
      )
    )
      .filter((record): record is NonNullable<typeof record> => record !== null)
      .sort((a, b) => {
        const roleWeight = { owner: 0, admin: 1, member: 2 } as const;

        return (
          roleWeight[a.role as keyof typeof roleWeight] -
            roleWeight[b.role as keyof typeof roleWeight] ||
          a.name.localeCompare(b.name)
        );
      });

    const avatarMode = profile?.avatarMode ?? 'provider';
    const customAvatarUrl = profile?.avatarUrl;

    return {
      user: {
        id: user._id,
        name: user.name ?? 'Unnamed User',
        email: user.email ?? '',
        avatar: getResolvedAvatar(user.image, avatarMode, customAvatarUrl),
        providerAvatar: user.image,
        customAvatarUrl,
        avatarMode,
        authProvider: 'google' as const,
      },
      summary: {
        memberSince: new Date(user._creationTime).toISOString(),
        workspaceCount: membershipRecords.length,
        ownerWorkspaceCount: membershipRecords.filter((membership) => membership.role === 'owner')
          .length,
        adminWorkspaceCount: membershipRecords.filter((membership) => membership.role === 'admin')
          .length,
        memberWorkspaceCount: membershipRecords.filter((membership) => membership.role === 'member')
          .length,
      },
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...(preferenceRecord
          ? {
              emailInvites: preferenceRecord.emailInvites,
              productUpdates: preferenceRecord.productUpdates,
              publishAlerts: preferenceRecord.publishAlerts,
              apiUsageAlerts: preferenceRecord.apiUsageAlerts,
            }
          : {}),
      },
      memberships: membershipRecords,
    };
  },
});

export const updateDisplayName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const trimmedName = args.name.trim();

    if (trimmedName.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    await ctx.db.patch(userId, {
      name: trimmedName,
    });

    return { success: true };
  },
});

export const updateAvatar = mutation({
  args: {
    avatarMode: v.union(v.literal('provider'), v.literal('custom')),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('userProfiles')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    let avatarUrl: string | undefined;

    if (args.avatarMode === 'custom') {
      const trimmedUrl = args.avatarUrl?.trim() ?? '';

      if (!trimmedUrl) {
        throw new Error('A custom avatar URL is required');
      }

      let parsedUrl: URL;

      try {
        parsedUrl = new URL(trimmedUrl);
      } catch {
        throw new Error('Enter a valid avatar URL');
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Avatar URL must start with http:// or https://');
      }

      avatarUrl = parsedUrl.toString();
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        avatarMode: args.avatarMode,
        avatarUrl,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('userProfiles', {
        userId,
        avatarMode: args.avatarMode,
        avatarUrl,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const updatePreferences = mutation({
  args: {
    emailInvites: v.boolean(),
    productUpdates: v.boolean(),
    publishAlerts: v.boolean(),
    apiUsageAlerts: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    const now = Date.now();
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    const payload = {
      emailInvites: args.emailInvites,
      productUpdates: args.productUpdates,
      publishAlerts: args.publishAlerts,
      apiUsageAlerts: args.apiUsageAlerts,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert('userPreferences', {
        userId,
        ...payload,
      });
    }

    return { success: true };
  },
});

export const resetPreferences = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query('userPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { success: true };
  },
});
