import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

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

    return {
      id: user._id,
      name: user.name ?? 'Unnamed User',
      email: user.email ?? '',
      avatar: user.image,
    };
  },
});

export const updateDisplayName = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Authentication required');
    }

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
