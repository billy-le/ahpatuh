import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { betterAuthComponent } from './auth';
import { createAuth } from './_utils';

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth);

http.route({
  path: '/api/widget',
  method: 'OPTIONS',
  handler: httpAction(async (_, request) => {
    const headers = request.headers;
    if (
      headers.get('Origin') !== null &&
      headers.get('Access-Control-Request-Method') !== null &&
      headers.get('Access-Control-Request-Headers') !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          // e.g. https://mywebsite.com, configured on your Convex dashboard
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Digest, api_key',
          'Access-Control-Max-Age': '86400',
        }),
      });
    } else {
      return new Response();
    }
  }),
});

http.route({
  path: '/api/widget',
  method: 'POST',
  handler: httpAction(async (_ctx, req) => {
    const headers = req.headers;
    if (!headers.get('api_key')) {
      return new Response(JSON.stringify({ message: 'Missing api key' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    return new Response(
      JSON.stringify({
        authorized: true,
      }),
      {
        status: 200,
        headers: new Headers({
          // e.g. https://mywebsite.com, configured on your Convex dashboard
          'Access-Control-Allow-Origin': '*',
          Vary: 'origin',
        }),
      },
    );
  }),
});

export default http;
