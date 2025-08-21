import { ConvexError } from 'convex/values';
import { Id } from './_generated/dataModel';
import { query } from './_generated/server';
import { betterAuthComponent } from './auth';

export const getLanguages = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await betterAuthComponent.getAuthUserId(
      ctx,
    )) as Id<'users'>;
    if (!userId) throw new ConvexError({ message: 'Forbidden', code: 403 });
    return await ctx.db.query('languages').collect();
  },
});
