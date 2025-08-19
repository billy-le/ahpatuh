import { createMiddleware, createServerFn, json } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { auth } from '~/utils/auth-server';
import type { GenericCtx } from 'convex/_generated/server';

export const getSession = createServerFn({ method: 'GET' }).handler(
  async ({ context }) => {
    const request = getWebRequest();
    if (!request.headers) {
      return null;
    }
    const session = await auth(context as unknown as GenericCtx).api.getSession(
      {
        headers: request.headers,
      },
    );
    return session;
  },
);

export const userMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await getSession();
    return next({ context: { userSession: session } });
  },
);

export const authMiddleware = createMiddleware({ type: 'function' })
  .middleware([userMiddleware])
  .server(async ({ next, context: { userSession } }) => {
    if (!userSession) {
      throw json({ message: 'Unauthenticated' }, { status: 401 });
    }
    return next({ context: { userSession } });
  });
