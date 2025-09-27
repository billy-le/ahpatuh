import { v } from 'convex/values';
import { internalQuery, mutation, query } from './_generated/server';
import { Doc } from './_generated/dataModel';
import { getAuthUser } from './_utils';

export const internalGetUser = internalQuery({
  args: {
    _id: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args._id);
  },
});

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    let language: Doc<'languages'> | null = null;
    if (user.langId) {
      language = await ctx.db.get(user.langId!);
    }
    let avatar:
      | (Doc<'media'> & {
          variants: Doc<'mediaVariants'>[];
        })
      | null = null;
    if (user.mediaId) {
      const media = await ctx.db.get(user.mediaId);
      const mediaMediaVariants = await ctx.db
        .query('mediaMediaVariants')
        .withIndex('by_mediaId', (q) => q.eq('mediaId', user.mediaId!))
        .collect();
      const mediaVariants = await Promise.all(
        mediaMediaVariants.map((mediaMediaVariant) =>
          ctx.db.get(mediaMediaVariant.mediaVariantId),
        ),
      );
      const nonNullVariants = mediaVariants.filter(
        (m): m is Doc<'mediaVariants'> => Boolean(m),
      );
      avatar = {
        ...media!,
        variants: nonNullVariants,
      };
    }
    return {
      ...user,
      language,
      avatar,
    };
  },
});

export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    langId: v.optional(v.id('languages')),
    image: v.optional(v.string()),
    timeZone: v.optional(v.string()),
    mediaId: v.optional(v.id('media')),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    return await ctx.db.patch(user._id, args).then(() => user._id);
  },
});
