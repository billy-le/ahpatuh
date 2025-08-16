import { betterAuth } from "better-auth";
import { reactStartCookies } from "better-auth/react-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "~/db/schema";

export const db = drizzle({
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

export const auth = betterAuth({
  baseUrl: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  sesseion: {
    cookieCache: {
      enabled: true,
      maxAge: 24 * 60, // one day
    },
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),
  emailAndPassword: { enabled: true },
  plugins: [reactStartCookies()],
});
