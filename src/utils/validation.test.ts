/**
 * Unit Tests for Validation Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateQueryParams,
  isCurrencySupported,
  isUSDPair,
  isValidAmount
} from './validation';

const USD = 'United States-Dollar';
const CANADA = 'Canada-Dollar';
const EURO = 'Euro Zone-Euro';

describe('Validation Utilities', () => {
  describe('validateQueryParams()', () => {
    it('should validate correct parameters', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100&from=${USD}&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.amount).toBe(100);
        expect(result.data.from).toBe(USD);
        expect(result.data.to).toBe(CANADA);
      }
    });

    it('should reject missing amount parameter', () => {
      const url = new URL(`http://localhost:8787/convert?from=${USD}&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.message).toContain('amount');
      }
    });

    it('should reject missing from parameter', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0]?.message).toContain('from');
      }
    });

    it('should reject missing to parameter', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100&from=${USD}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0]?.message).toContain('to');
      }
    });

    it('should reject all missing parameters', () => {
      const url = new URL('http://localhost:8787/convert');
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors[0]?.message).toContain('amount');
        expect(result.errors[0]?.message).toContain('from');
        expect(result.errors[0]?.message).toContain('to');
      }
    });

    it('should reject invalid amount (NaN)', () => {
      const url = new URL(`http://localhost:8787/convert?amount=invalid&from=${USD}&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some(e => e.field === 'amount')).toBe(true);
        expect(result.errors.find(e => e.field === 'amount')?.message).toContain('valid number');
      }
    });

    it('should reject negative amount', () => {
      const url = new URL(`http://localhost:8787/convert?amount=-100&from=${USD}&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some(e => e.field === 'amount')).toBe(true);
        expect(result.errors.find(e => e.field === 'amount')?.message).toContain('greater than 0');
      }
    });

    it('should reject zero amount', () => {
      const url = new URL(`http://localhost:8787/convert?amount=0&from=${USD}&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some(e => e.field === 'amount')).toBe(true);
      }
    });

    it('should reject unsupported from currency', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100&from=FakeCurrency&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some(e => e.field === 'from')).toBe(true);
        expect(result.errors.find(e => e.field === 'from')?.message).toContain('not supported');
      }
    });

    it('should reject unsupported to currency', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100&from=${USD}&to=FakeCurrency`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some(e => e.field === 'to')).toBe(true);
        expect(result.errors.find(e => e.field === 'to')?.message).toContain('not supported');
      }
    });

    it('should reject non-USD currency pairs', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100&from=${CANADA}&to=${EURO}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.some(e => e.field === 'currencies')).toBe(true);
        expect(result.errors.find(e => e.field === 'currencies')?.message).toContain(USD);
      }
    });

    it('should accept decimal amounts', () => {
      const url = new URL(`http://localhost:8787/convert?amount=100.50&from=${USD}&to=${CANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.amount).toBe(100.50);
      }
    });

    it('should accept URL-encoded currency names with spaces', () => {
      const encodedUSD = encodeURIComponent(USD);
      const encodedCANADA = encodeURIComponent(CANADA);
      const url = new URL(`http://localhost:8787/convert?amount=100&from=${encodedUSD}&to=${encodedCANADA}`);
      const result = validateQueryParams(url);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.data.from).toBe(USD);
        expect(result.data.to).toBe(CANADA);
      }
    });
  });

  describe('isCurrencySupported()', () => {
    it('should return true for USD', () => {
      expect(isCurrencySupported(USD)).toBe(true);
    });

    it('should return true for Canada-Dollar', () => {
      expect(isCurrencySupported(CANADA)).toBe(true);
    });

    it('should return false for unsupported currency', () => {
      expect(isCurrencySupported('FakeCurrency')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isCurrencySupported('')).toBe(false);
    });
  });

  describe('isUSDPair()', () => {
    it('should return true when from is USD', () => {
      expect(isUSDPair(USD, CANADA)).toBe(true);
    });

    it('should return true when to is USD', () => {
      expect(isUSDPair(CANADA, USD)).toBe(true);
    });

    it('should return true when both are USD', () => {
      expect(isUSDPair(USD, USD)).toBe(true);
    });

    it('should return false for non-USD pairs', () => {
      expect(isUSDPair(CANADA, EURO)).toBe(false);
    });
  });

  describe('isValidAmount()', () => {
    it('should return true for positive numbers', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
      expect(isValidAmount(1000000)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isValidAmount(0)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(-0.01)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidAmount(NaN)).toBe(false);
    });
  });
});
