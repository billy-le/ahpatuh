'use node';
import { action } from './_generated/server';
import { ConvexError } from 'convex/values';
import { internal } from './_generated/api';
import { Id } from './_generated/dataModel';
import dns from 'node:dns/promises';
import bcrypt from 'bcryptjs';

export const verifyDomain: ReturnType<typeof action> = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ message: 'Forbidden', code: 403 });

    const user = await ctx.runQuery(internal.users.internalGetUser, {
      _id: identity.subject as Id<'users'>,
    });
    if (!user) throw new ConvexError({ message: 'User not found', code: 404 });
    const business = await ctx.runQuery(internal.business.internalGetBusiness, {
      userId: user._id,
    });
    if (!business)
      throw new ConvexError({ message: 'Business not found', code: 404 });

    const businessDomain = await ctx.runQuery(
      internal.business_domains.internalGetBusinessDomains,
      {
        businessId: business._id,
      },
    );
    if (!businessDomain)
      throw new ConvexError({ message: 'Domain not found', code: 404 });
    const domain = await ctx.runQuery(internal.domains.internalGetDomainById, {
      _id: businessDomain.domainId,
    });
    if (!domain)
      throw new ConvexError({ message: 'Domain not found', code: 404 });
    const { name: domainName, challengeSecret, challengePublic } = domain;
    const hostname = domainName.replace(/^https?:\/\//, '').split('/')[0];
    const txtRecords = await dns
      .resolveTxt(hostname)
      .then((records) => records.flat());

    let txtChallenge = txtRecords.find((record) => record === challengePublic);
    if (!txtChallenge)
      throw new ConvexError({ message: 'TXT Record not found', code: 404 });
    txtChallenge = txtChallenge.replace('_widget:', '');
    const isValid = bcrypt.compareSync(challengeSecret, txtChallenge);
    if (isValid) {
      return await ctx
        .runMutation(internal.domains.internalVerifyDomain, {
          _id: domain._id,
        })
        .then(() => domain._id);
    }

    throw new ConvexError({ message: 'Invalid Challenge', code: 400 });
  },
});
