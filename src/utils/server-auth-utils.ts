import { auth } from "./auth-server";
import { reactStartHelpers } from "@convex-dev/better-auth/react-start";

export const { fetchSession, reactStartHandler, getCookieName } =
  reactStartHelpers(auth, {
    convexSiteUrl: import.meta.env.VITE_CONVEX_SITE_URL,
  });
