/**
 * Hello World API - Cloudflare Worker
 *
 * This Worker implements a simple HTTP GET endpoint that returns
 * a JSON response with a greeting message.
 */

import { handleConvert } from './handlers/convertHandler';

// ExecutionContext type for Cloudflare Workers
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    // Extract request information
    const { method, url } = request;
    const { pathname } = new URL(url);

    // Only allow GET requests
    if (method !== 'GET') {
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
          message: 'This API only supports GET requests',
          allowed_methods: ['GET']
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Allow': 'GET'
          }
        }
      );
    }

    // Route handling
    switch (pathname) {
      case '/health':
        return new Response(
          JSON.stringify({
            status: 'healthy',
            uptime: 'Workers are stateless - always ready!'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

      case '/convert':
        return handleConvert(request);

      default:
        return new Response(
          JSON.stringify({
            error: 'Not found',
            message: `Path ${pathname} does not exist`,
            available_endpoints: ['/health', '/convert']
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
    }
  }
};
