import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUser, getBusiness } from './_utils';
import { Id } from './_generated/dataModel';

export const getMedia = query({
  args: {},
  handler: async (ctx, _args) => {
    const user = await getAuthUser(ctx);
    const _business = await getBusiness(ctx, user);

    console.log('success');
    return null;
  },
});

export const mutateMedia = mutation({
  args: {
    fileName: v.string(),
  },
  handler: async (_ctx, args) => {
    console.log(args);

    console.log('success');

    return Promise.resolve('test' as Id<'media'>);
  },
});
