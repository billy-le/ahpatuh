import { ConvexError, v } from 'convex/values';
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { generateUUID, getAuthUser, getBusiness } from './_utils';
import { domain } from './schema';
import bcrypt from 'bcryptjs';

export const getDomain = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const businessDomain = await ctx.db
      .query('businessDomains')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .unique();
    if (!businessDomain)
      throw new ConvexError({
        message: 'Business domain not found',
        code: 404,
      });
    const domain = await ctx.db.get(businessDomain.domainId);
    if (!domain)
      throw new ConvexError({ message: 'Domain not found', code: 404 });
    return domain;
  },
});

export const internalGetDomainById = internalQuery({
  args: {
    _id: v.id('domains'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args._id);
  },
});

export const internalGetDomain = internalQuery({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('domains')
      .withIndex('by_name_publicKey', (q) => q.eq('name', args.name))
      .unique();
  },
});

export const internalVerifyDomain = internalMutation({
  args: {
    _id: v.id('domains'),
  },
  handler: async (ctx, args) => {
    const publicKey = bcrypt.hashSync(
      await generateUUID(),
      bcrypt.genSaltSync(10),
    );
    return await ctx.db.patch(args._id, {
      publicKey,
      isVerified: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const mutateDomain = mutation({
  args: {
    _id: v.optional(v.id('domains')),
    name: v.string(),
    status: v.optional(domain['status']),
    isVerfied: v.optional(domain['isVerified']),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const challengeSecret = await generateUUID();
    const challengePublic =
      '_widget:' + bcrypt.hashSync(challengeSecret, bcrypt.genSaltSync(10));

    if (args._id && args.name) {
      const domain = await ctx.db.get(args._id);
      if (!domain)
        throw new ConvexError({ message: 'Domain not found', code: 404 });
      const businessDomain = await ctx.db
        .query('businessDomains')
        .withIndex('by_domainId', (q) => q.eq('domainId', domain._id))
        .unique();
      if (!businessDomain)
        throw new ConvexError({
          message: 'Business Domain not found',
          code: 404,
        });
      if (businessDomain.businessId !== business._id)
        throw new ConvexError({ message: 'Invalid Domain Id', code: 403 });
      const { _id, ...params } = args;
      return await ctx.db
        .patch(domain._id, {
          ...params,
          isVerified: args.name === domain.name && domain.isVerified,
          challengeSecret,
          challengePublic,
          publicKey: undefined,
          updatedAt: new Date().toISOString(),
        })
        .then(() => domain._id);
    }

    const domainId = await ctx.db.insert('domains', {
      name: args.name,
      challengeSecret,
      challengePublic,
      publicKey: undefined,
      isVerified: false,
      status: 'active',
      updatedAt: new Date().toISOString(),
    });
    if (domainId) {
      await ctx.db.insert('businessDomains', {
        businessId: business._id,
        domainId,
      });
    }
    return domainId;
  },
});

export const deleteDomain = mutation({
  args: {
    _id: v.id('domains'),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const domain = await ctx.db.get(args._id);
    if (!domain)
      throw new ConvexError({ message: 'Domain not found', code: 404 });
    const businessDomain = await ctx.db
      .query('businessDomains')
      .withIndex('by_domainId', (q) => q.eq('domainId', domain._id))
      .unique();
    if (!businessDomain)
      throw new ConvexError({
        message: 'Business Domain not found',
        code: 404,
      });
    if (businessDomain.businessId !== business._id)
      throw new ConvexError({ message: 'Invalid Domain Id', code: 403 });
    await ctx.db.delete(businessDomain._id);
    return await ctx.db.delete(domain._id);
  },
});
