/**
 * Integration Tests for Cloudflare Worker
 *
 * These tests validate the complete worker request/response cycle including:
 * - HTTP method validation
 * - Routing logic
 * - End-to-end API functionality
 *
 * Tests import the worker directly and call its fetch() handler with mock
 * Request objects, simulating the complete request/response cycle.
 */

import { describe, it, expect } from 'vitest';
import worker from './index';

// Mock ExecutionContext for testing
const createMockExecutionContext = (): ExecutionContext => ({
  waitUntil: () => {},
  passThroughOnException: () => {}
});

// Mock Env for testing (empty for now)
const mockEnv = {} as Env;

describe('Cloudflare Worker Integration Tests', () => {
  describe('Method validation', () => {
    it('should allow GET requests', async () => {
      // Test that GET requests are accepted by the worker
      // This is the only HTTP method supported by the API
      const response = await worker.fetch(new Request('http://example.com/health'), mockEnv, createMockExecutionContext());

      // Verify the request is processed (not rejected with 405)
      expect(response.status).not.toBe(405);
      expect(response.status).toBe(200);
    });

    it('should reject POST requests with 405', async () => {
      // Test that POST requests are rejected with Method Not Allowed
      // This enforces the API's GET-only constraint
      const response = await worker.fetch(new Request('http://example.com/health', {
        method: 'POST'
      }), mockEnv, createMockExecutionContext());

      // Verify 405 Method Not Allowed response
      expect(response.status).toBe(405);

      // Verify the Allow header indicates only GET is supported
      expect(response.headers.get('Allow')).toBe('GET');

      const data = await response.json();

      // Verify error response structure
      expect(data.error).toBe('Method not allowed');
      expect(data.message).toContain('GET requests');
      expect(data.allowed_methods).toEqual(['GET']);
    });

    it('should reject PUT requests with 405', async () => {
      // Test that PUT requests are rejected
      const response = await worker.fetch(new Request('http://example.com/health', {
        method: 'PUT'
      }), mockEnv, createMockExecutionContext());

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('GET');

      const data = await response.json();
      expect(data.error).toBe('Method not allowed');
    });

    it('should reject DELETE requests with 405', async () => {
      // Test that DELETE requests are rejected
      const response = await worker.fetch(new Request('http://example.com/health', {
        method: 'DELETE'
      }), mockEnv, createMockExecutionContext());

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('GET');

      const data = await response.json();
      expect(data.error).toBe('Method not allowed');
    });

    it('should include Allow header in 405 response', async () => {
      // Test that 405 responses include the Allow header
      // This header informs clients which HTTP methods are supported
      const response = await worker.fetch(new Request('http://example.com/convert', {
        method: 'PATCH'
      }), mockEnv, createMockExecutionContext());

      expect(response.status).toBe(405);

      // Verify the Allow header is present and correct
      const allowHeader = response.headers.get('Allow');
      expect(allowHeader).toBe('GET');
    });
  });

  describe('Routing', () => {
    it('should respond to /health endpoint', async () => {
      // Test that the /health endpoint returns a healthy status
      // This endpoint is used for health checks and monitoring
      const response = await worker.fetch(new Request('http://example.com/health'), mockEnv, createMockExecutionContext());

      // Verify successful response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();

      // Verify health check response structure
      expect(data).toMatchObject({
        status: 'healthy',
        uptime: expect.any(String)
      });

      // Verify the uptime message is present
      expect(data.uptime).toContain('stateless');
    });

    it('should respond to /convert endpoint', async () => {
      // Test that the /convert endpoint is accessible and processes requests
      // This validates the routing to the conversion handler
      const url = `http://example.com/convert?amount=100&from=${encodeURIComponent('United States-Dollar')}&to=${encodeURIComponent('Canada-Dollar')}`;
      const response = await worker.fetch(new Request(url), mockEnv, createMockExecutionContext());

      // Verify successful response (not 404)
      expect(response.status).toBe(200);

      const data = await response.json();

      // Verify the conversion endpoint returns conversion data
      expect(data.converted_amount).toBeDefined();
      expect(data.rate).toBeDefined();
    });

    it('should return 404 for unknown routes', async () => {
      // Test that unknown paths return 404 Not Found
      // This validates the default case in the routing switch statement
      const response = await worker.fetch(new Request('http://example.com/unknown-path'), mockEnv, createMockExecutionContext());

      // Verify 404 Not Found response
      expect(response.status).toBe(404);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();

      // Verify 404 error response structure
      expect(data.error).toBe('Not found');
      expect(data.message).toContain('unknown-path');
      expect(data.message).toContain('does not exist');

      // Verify the response includes a list of available endpoints
      expect(data.available_endpoints).toBeDefined();
      expect(Array.isArray(data.available_endpoints)).toBe(true);
      expect(data.available_endpoints).toContain('/health');
      expect(data.available_endpoints).toContain('/convert');
    });

    it('should return 404 for root path', async () => {
      // Test that the root path (/) returns 404
      // This API doesn't have a root endpoint - clients must use specific paths
      const response = await worker.fetch(new Request('http://example.com/'), mockEnv, createMockExecutionContext());

      // Verify 404 Not Found response
      expect(response.status).toBe(404);

      const data = await response.json();

      // Verify error mentions the root path
      expect(data.message).toContain('/');
      expect(data.available_endpoints).toContain('/health');
      expect(data.available_endpoints).toContain('/convert');
    });
  });

  describe('End-to-end conversion', () => {
    it('should perform successful currency conversion with full request cycle', async () => {
      // Test the complete end-to-end flow for a successful currency conversion
      // This validates: routing → handler → validation → conversion → response
      const url = `http://example.com/convert?amount=100&from=${encodeURIComponent('United States-Dollar')}&to=${encodeURIComponent('Canada-Dollar')}`;
      const response = await worker.fetch(new Request(url), mockEnv, createMockExecutionContext());

      // Verify successful HTTP response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');

      const data = await response.json();

      // Verify complete response structure
      expect(data).toMatchObject({
        amount: 100,
        from: 'United States-Dollar',
        to: 'Canada-Dollar',
        converted_amount: expect.any(Number),
        rate: expect.any(Number),
        timestamp: expect.any(String)
      });

      // Verify conversion logic produced reasonable results
      expect(data.converted_amount).toBeGreaterThan(100);
      expect(data.rate).toBeGreaterThan(1);

      // Verify timestamp is in ISO 8601 format
      const timestamp = new Date(data.timestamp);
      expect(timestamp.toISOString()).toBe(data.timestamp);
    });

    it('should handle validation errors end-to-end', async () => {
      // Test the complete flow for a request with validation errors
      // This validates: routing → handler → validation → error response
      const url = 'http://example.com/convert?amount=invalid&from=USD&to=CAD';
      const response = await worker.fetch(new Request(url), mockEnv, createMockExecutionContext());

      // Verify 400 Bad Request response
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();

      // Verify error response structure
      expect(data.error).toBe('Invalid parameters');
      expect(data.message).toBeDefined();
      expect(data.details).toBeDefined();

      // Verify the error details contain specific validation failures
      expect(typeof data.details).toBe('object');
    });

    it('should handle non-USD currency pair errors end-to-end', async () => {
      // Test the complete flow for an unsupported currency pair
      // This validates the business rule: only USD-based conversions are allowed
      const url = `http://example.com/convert?amount=100&from=${encodeURIComponent('Canada-Dollar')}&to=${encodeURIComponent('Euro')}`;
      const response = await worker.fetch(new Request(url), mockEnv, createMockExecutionContext());

      // Verify 400 Bad Request response for unsupported pair
      expect(response.status).toBe(400);

      const data = await response.json();

      // Verify error indicates the USD requirement
      expect(data.error).toBe('Invalid parameters');
      expect(data.details).toBeDefined();
      expect(data.details.currencies).toContain('United States-Dollar');
    });
  });
});
