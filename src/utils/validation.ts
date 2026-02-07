/**
 * Validation Utilities for Currency Converter API
 */

import { exchangeRates } from '../data/exchangeRates';
import type { ValidationResult, ValidationError } from '../types';

const USD_CURRENCY = 'United States-Dollar';

/**
 * Validate and parse query parameters from URL
 */
export function validateQueryParams(url: URL): ValidationResult {
  const errors: ValidationError[] = [];
  const searchParams = url.searchParams;

  // Extract parameters
  const amountStr = searchParams.get('amount');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Check for missing parameters
  const missingParams: string[] = [];
  if (!amountStr) missingParams.push('amount');
  if (!from) missingParams.push('from');
  if (!to) missingParams.push('to');

  if (missingParams.length > 0) {
    errors.push({
      field: 'parameters',
      message: `Missing required parameters: ${missingParams.join(', ')}`
    });
    return { valid: false, errors };
  }

  // Validate amount
  const amount = parseFloat(amountStr!);
  if (isNaN(amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a valid number'
    });
  } else if (amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0'
    });
  }

  // Validate currency names exist in exchange rates
  if (from && !exchangeRates.has(from)) {
    errors.push({
      field: 'from',
      message: `Currency '${from}' is not supported`
    });
  }

  if (to && !exchangeRates.has(to)) {
    errors.push({
      field: 'to',
      message: `Currency '${to}' is not supported`
    });
  }

  // Validate at least one currency is USD
  if (from && to && from !== USD_CURRENCY && to !== USD_CURRENCY) {
    errors.push({
      field: 'currencies',
      message: `Only conversions involving '${USD_CURRENCY}' are supported`
    });
  }

  // Return result
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      amount,
      from: from!,
      to: to!
    }
  };
}

/**
 * Check if a currency name is supported
 */
export function isCurrencySupported(currencyName: string): boolean {
  return exchangeRates.has(currencyName);
}

/**
 * Validate that at least one currency in the pair is USD
 */
export function isUSDPair(from: string, to: string): boolean {
  return from === USD_CURRENCY || to === USD_CURRENCY;
}

/**
 * Validate amount is a positive number
 */
export function isValidAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0;
}
