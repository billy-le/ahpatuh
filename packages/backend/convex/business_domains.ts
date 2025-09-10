import { v } from 'convex/values';
import { internalQuery } from './_generated/server';

export const internalGetBusinessDomains = internalQuery({
  args: {
    businessId: v.id('businesses'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('businessDomains')
      .withIndex('by_businessId', (q) => q.eq('businessId', args.businessId))
      .unique();
  },
});
