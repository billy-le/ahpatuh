import { GenericMutationCtx, GenericQueryCtx } from 'convex/server';
import { DataModel, Doc, Id } from './_generated/dataModel';
import { ConvexError } from 'convex/values';

export type GenericCtx =
  | GenericMutationCtx<DataModel>
  | GenericQueryCtx<DataModel>;

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
