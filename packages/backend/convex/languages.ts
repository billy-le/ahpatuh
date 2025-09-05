import { query } from './_generated/server';
import { getAuthUser } from './_utils';

export const getLanguages = query({
  args: {},
  handler: async (ctx) => {
    await getAuthUser(ctx);
    return await ctx.db.query('languages').collect();
  },
});
