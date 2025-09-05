import type { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import type { GenericCtx as Ctx } from './_generated/server';
import { DataModel, Doc, Id } from './_generated/dataModel';
import { ConvexError } from 'convex/values';
import { convexAdapter } from '@convex-dev/better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { requireEnv } from '@convex-dev/better-auth/utils';
import { betterAuth } from 'better-auth';
import { betterAuthComponent } from './auth';

const siteUrl = requireEnv('SITE_URL');

type GenericCtx = GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>;

export const createAuth = (ctx: Ctx) =>
  // Configure your Better Auth instance here
  betterAuth({
    // All auth requests will be proxied through your TanStack Start server
    baseURL: siteUrl,
    database: convexAdapter(ctx, betterAuthComponent),
    // Simple non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required
      convex(),
    ],
  });

export async function getAuthUser(ctx: GenericCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError({ message: 'Forbidden', code: 403 });
  const userId = identity.subject as Id<'users'>;

  const user = await ctx.db
    .query('users')
    .withIndex('by_id', (q) => q.eq('_id', userId))
    .unique();
  if (!user) throw new ConvexError({ message: 'User not found', code: 404 });
  return user;
}

export async function getBusiness(ctx: GenericCtx, user: Doc<'users'>) {
  const business = await ctx.db
    .query('businesses')
    .withIndex('by_userId', (q) => q.eq('userId', user._id))
    .unique();
  if (!business)
    throw new ConvexError({ message: 'Business not found', code: 404 });
  return business;
}
