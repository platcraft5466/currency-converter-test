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
      case '/':
      case '/hello':
        return new Response(
          JSON.stringify({
            message: 'Hello World!',
            timestamp: new Date().toISOString(),
            worker: 'APiClaude Hello World API',
            version: '1.0.0'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

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
            available_endpoints: ['/', '/hello', '/health', '/convert']
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
