/**
 * Currency Conversion Logic
 */

import { exchangeRates } from '../data/exchangeRates';

const USD_CURRENCY = 'United States-Dollar';

/**
 * Convert amount from one currency to another
 *
 * Supports conversions where USD is either the source or target currency.
 * The CSV provides rates in format: 1 USD = X foreign_currency
 *
 * @param amount - The amount to convert
 * @param from - Source currency full name
 * @param to - Target currency full name
 * @returns Converted amount rounded to 2 decimal places
 * @throws Error if currencies are not found or conversion is not supported
 */
export function convert(amount: number, from: string, to: string): number {
  // Special case: same currency
  if (from === to) {
    return roundToTwoDecimals(amount);
  }

  // Get exchange rates
  const fromRate = exchangeRates.get(from);
  const toRate = exchangeRates.get(to);

  if (!fromRate) {
    throw new Error(`Currency '${from}' not found in exchange rates`);
  }

  if (!toRate) {
    throw new Error(`Currency '${to}' not found in exchange rates`);
  }

  // Validate at least one currency is USD
  if (from !== USD_CURRENCY && to !== USD_CURRENCY) {
    throw new Error(`Only conversions involving '${USD_CURRENCY}' are supported`);
  }

  // Perform conversion
  let result: number;

  if (from === USD_CURRENCY) {
    // USD → Foreign Currency
    // Formula: amount * toRate
    // Example: 100 USD → Canada-Dollar (rate = 1.369)
    // result = 100 * 1.369 = 136.90
    result = amount * toRate.rate;
  } else if (to === USD_CURRENCY) {
    // Foreign Currency → USD
    // Formula: amount / fromRate
    // Example: 136.90 Canada-Dollar → USD (rate = 1.369)
    // result = 136.90 / 1.369 = 100.00
    result = amount / fromRate.rate;
  } else {
    // This should never happen due to validation
    throw new Error('Invalid conversion pair');
  }

  return roundToTwoDecimals(result);
}

/**
 * Round a number to 2 decimal places
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Get the exchange rate for a specific currency pair
 * Returns the rate that will be used in the conversion
 *
 * @param from - Source currency
 * @param to - Target currency
 * @returns The effective exchange rate, or null if not found
 */
export function getEffectiveRate(from: string, to: string): number | null {
  if (from === to) {
    return 1.0;
  }

  const fromRate = exchangeRates.get(from);
  const toRate = exchangeRates.get(to);

  if (!fromRate || !toRate) {
    return null;
  }

  if (from === USD_CURRENCY) {
    return toRate.rate;
  } else if (to === USD_CURRENCY) {
    return 1 / fromRate.rate;
  } else {
    return null;
  }
}
