import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { requireUserId } from './lib/workspace';

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const preference = await ctx.db
      .query('editorPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    return {
      autosaveEnabled: preference?.autosaveEnabled ?? false,
    };
  },
});

export const set = mutation({
  args: {
    autosaveEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query('editorPreferences')
      .withIndex('by_user_id', (q) => q.eq('userId', userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        autosaveEnabled: args.autosaveEnabled,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert('editorPreferences', {
        userId,
        autosaveEnabled: args.autosaveEnabled,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});
