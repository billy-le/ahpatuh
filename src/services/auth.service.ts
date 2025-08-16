import { createMiddleware, createServerFn, json } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "~/utils/auth-server";

export const getUserSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getWebRequest();
    if (!request.headers) {
      return null;
    }
    const userSession = await auth.api.getSession({ headers: request.headers });
    return { userSession };
  },
);

export const userMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const userSession = await getUserSession();
    return next({ context: { userSession } });
  },
);

export const authMiddleware = createMiddleware({ type: "function" })
  .middleware([userMiddleware])
  .server(async ({ next, context: { userSession } }) => {
    if (!userSession) {
      throw json({ message: "Unauthenticated" }, { status: 401 });
    }
    return next({ context: { userSession } });
  });
