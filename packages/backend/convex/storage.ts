import { v } from 'convex/values';
import { query } from './_generated/server';
import { getAuthUser } from './_utils';

export const getStorageUrl = query({
  args: {
    _id: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await getAuthUser(ctx);
    return await ctx.storage.getUrl(args._id);
  },
});
