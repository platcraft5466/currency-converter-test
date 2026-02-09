/**
 * Type Definitions for Currency Converter API
 */

/**
 * Exchange rate data structure
 */
export interface ExchangeRateData {
  currencyName: string;
  rate: number; // 1 USD = rate units of foreign currency
  effectiveDate: string;
}

/**
 * Currency conversion request parameters
 */
export interface ConversionRequest {
  amount: number;
  from: string; // Full currency name (e.g., "United States-Dollar")
  to: string; // Full currency name (e.g., "Canada-Dollar")
}

/**
 * Currency conversion response
 */
export interface ConversionResponse {
  amount: number;
  from: string;
  to: string;
  converted_amount: number;
  rate: number;
  timestamp: string;
  total_currencies: number;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Result type for validation
 */
export type ValidationResult =
  | { valid: true; data: ConversionRequest }
  | { valid: false; errors: ValidationError[] };
