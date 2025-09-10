import { query, mutation, internalQuery } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { omit } from 'ramda';
import { getAuthUser, getBusiness } from './_utils';
import { Doc, Id } from './_generated/dataModel';
import { api } from './_generated/api';

export const internalGetBusiness = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('businesses')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();
  },
});

export const createBusiness = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    domain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    let domainId: Id<'domains'> | null = null;
    if (args.domain) {
      await ctx.db
        .query('domains')
        .withIndex('by_name_challengePublic', (q) => q.eq('name', args.domain!))
        .unique();

      domainId = await ctx.runMutation(api.domains.mutateDomain, {
        name: args.domain,
        isVerfied: false,
        status: 'active',
      });
    }
    const businessId = await ctx.db.insert('businesses', {
      name: args.name,
      email: args.email,
      phone: args.phone,
      userId: user._id,
      updatedAt: new Date().toISOString(),
    });

    if (domainId) {
      await ctx.db.insert('businessDomains', {
        businessId,
        domainId,
      });
    }
    return businessId;
  },
});

export const getBusinessDetails = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    const address = await ctx.db
      .query('addresses')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .unique();
    const businessHours = await ctx.db
      .query('businessHours')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .collect();
    const businessDomain = await ctx.db
      .query('businessDomains')
      .withIndex('by_businessId', (q) => q.eq('businessId', business._id))
      .unique();
    let domain: Doc<'domains'> | null = null;
    if (businessDomain) {
      domain = await ctx.db.get(businessDomain.domainId);
    }
    const businessOmittedFields = omit(
      ['_creationTime', 'updatedAt', 'userId'],
      business,
    );
    return {
      ...businessOmittedFields,
      domain: domain ? omit(['challengeSecret'], domain) : null,
      address: address ? omit(['_creationTime', 'updatedAt'], address) : null,
      businessHours: businessHours.map((hours) =>
        omit(['_creationTime', 'updatedAt'], hours),
      ),
    };
  },
});

export const updateBusiness = mutation({
  args: {
    _id: v.id('businesses'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    const business = await getBusiness(ctx, user);
    if (args._id !== business._id)
      throw new ConvexError({ message: 'Invalid Business Id', code: 403 });

    const { _id, ...params } = args;
    return await ctx.db
      .patch(business._id, {
        ...params,
        updatedAt: new Date().toISOString(),
      })
      .then(() => _id);
  },
});
