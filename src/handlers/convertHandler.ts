/**
 * Currency Conversion Endpoint Handler
 */

import { validateQueryParams } from '../utils/validation';
import { convert, getEffectiveRate } from '../utils/converter';
import type { ConversionResponse } from '../types';

/**
 * Handle currency conversion requests
 *
 * @param request - The incoming HTTP request
 * @returns Response with conversion result or error
 */
export async function handleConvert(request: Request): Promise<Response> {
  try {
    // Parse URL
    const url = new URL(request.url);

    // Validate query parameters
    const validationResult = validateQueryParams(url);

    if (!validationResult.valid) {
      // Build error details object
      const details: Record<string, string> = {};
      for (const error of validationResult.errors) {
        details[error.field] = error.message;
      }

      return new Response(
        JSON.stringify({
          error: 'Invalid parameters',
          message: validationResult.errors[0]?.message || 'Invalid request parameters',
          details
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Extract validated data
    const { amount, from, to } = validationResult.data;

    // Perform conversion
    const convertedAmount = convert(amount, from, to);
    const effectiveRate = getEffectiveRate(from, to);

    // Build response
    const response: ConversionResponse = {
      amount,
      from,
      to,
      converted_amount: convertedAmount,
      rate: effectiveRate ?? 1.0,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: 'Conversion failed',
        message: errorMessage
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
