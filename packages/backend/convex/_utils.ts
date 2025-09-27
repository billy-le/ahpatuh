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

export const createAuth: (ctx: Ctx) => ReturnType<typeof betterAuth> = (
  ctx: Ctx,
) =>
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

export async function generateUUID() {
  // Generate 16 random bytes using crypto.subtle
  const array = new Uint8Array(16);
  const randomBytes = await crypto.subtle.digest(
    'SHA-256',
    crypto.getRandomValues(array),
  );
  const bytes = new Uint8Array(randomBytes).slice(0, 16);

  // Set version (4) and variant bits according to RFC 4122
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant bits

  // Convert to hex string with hyphens
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}
