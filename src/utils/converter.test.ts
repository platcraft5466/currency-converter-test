/**
 * Unit Tests for Currency Converter
 */

import { describe, it, expect } from 'vitest';
import { convert, getEffectiveRate } from './converter';

const USD = 'United States-Dollar';
const CANADA = 'Canada-Dollar';
const EURO = 'Euro Zone-Euro';

describe('Currency Converter', () => {
  describe('convert()', () => {
    it('should convert USD to foreign currency', () => {
      // Canada-Dollar rate is approximately 1.369
      const result = convert(100, USD, CANADA);
      expect(result).toBeGreaterThan(130);
      expect(result).toBeLessThan(140);
    });

    it('should convert foreign currency to USD', () => {
      // Reverse conversion: Canada-Dollar to USD
      const usdToCanada = convert(100, USD, CANADA);
      const canadaToUsd = convert(usdToCanada, CANADA, USD);
      expect(canadaToUsd).toBeCloseTo(100, 1);
    });

    it('should handle USD to USD conversion', () => {
      const result = convert(100, USD, USD);
      expect(result).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      const result = convert(100.123, USD, CANADA);
      const decimalPlaces = (result.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should throw error for non-USD pairs', () => {
      expect(() => convert(100, CANADA, EURO)).toThrow(
        "Only conversions involving 'United States-Dollar' are supported"
      );
    });

    it('should throw error for unsupported currency', () => {
      expect(() => convert(100, USD, 'FakeCurrency')).toThrow(
        "Currency 'FakeCurrency' not found in exchange rates"
      );
    });

    it('should handle decimal amounts correctly', () => {
      const result = convert(50.5, USD, CANADA);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(50.5 * 1.369, 0);
    });

    it('should handle large amounts', () => {
      const result = convert(1000000, USD, CANADA);
      expect(result).toBeGreaterThan(1000000);
    });

    it('should handle small amounts', () => {
      const result = convert(0.01, USD, CANADA);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(0.02);
    });
  });

  describe('getEffectiveRate()', () => {
    it('should return rate for USD to foreign currency', () => {
      const rate = getEffectiveRate(USD, CANADA);
      expect(rate).toBeGreaterThan(1);
      expect(rate).toBeLessThan(2);
    });

    it('should return rate for foreign currency to USD', () => {
      const rate = getEffectiveRate(CANADA, USD);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(1);
    });

    it('should return 1.0 for same currency', () => {
      const rate = getEffectiveRate(USD, USD);
      expect(rate).toBe(1.0);
    });

    it('should return null for non-USD pairs', () => {
      const rate = getEffectiveRate(CANADA, EURO);
      expect(rate).toBeNull();
    });

    it('should return null for unsupported currency', () => {
      const rate = getEffectiveRate(USD, 'FakeCurrency');
      expect(rate).toBeNull();
    });
  });
});
