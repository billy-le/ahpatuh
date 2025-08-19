import { betterAuth } from 'better-auth';
import { convex } from '@convex-dev/better-auth/plugins';
import { convexAdapter } from '@convex-dev/better-auth';
import { betterAuthComponent } from '../../convex/auth';
import { type GenericCtx } from '../../convex/_generated/server';

const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = (ctx: GenericCtx) => {
  return betterAuth({
    baseUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [baseUrl],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 24 * 60, // one day
      },
    },
    database: convexAdapter(ctx, betterAuthComponent),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    plugins: [convex()],
  });
};
