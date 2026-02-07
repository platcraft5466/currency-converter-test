/**
 * CSV to JSON Converter - Build Script
 *
 * This script converts the Treasury exchange rate CSV data into a TypeScript
 * module for use in the Cloudflare Worker. It filters to the latest rates
 * (2025-12-31) and generates a Map for O(1) lookups.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExchangeRateData {
  currencyName: string;
  rate: number;
  effectiveDate: string;
}

/**
 * Parse a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Main conversion function
 */
function convertCSVToJSON(): void {
  console.log('🔄 Converting CSV to TypeScript module...');

  // Read the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'RprtRateXchgCln_with_ISO.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');

  // Parse header
  const header = parseCSVLine(lines[0]);
  const recordDateIndex = header.indexOf('Record Date');
  const currencyNameIndex = header.indexOf('Country - Currency Description');
  const exchangeRateIndex = header.indexOf('Exchange Rate');
  const effectiveDateIndex = header.indexOf('Effective Date');

  if (recordDateIndex === -1 || currencyNameIndex === -1 || exchangeRateIndex === -1 || effectiveDateIndex === -1) {
    throw new Error('CSV header is missing required columns');
  }

  console.log(`📊 Found ${lines.length - 1} rows in CSV`);

  // Parse data rows and filter for latest date (2025-12-31)
  const exchangeRates = new Map<string, ExchangeRateData>();
  let processedCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 5) continue;

    const recordDate = fields[recordDateIndex];
    const currencyName = fields[currencyNameIndex];
    const exchangeRateStr = fields[exchangeRateIndex];
    const effectiveDate = fields[effectiveDateIndex];

    // Filter: only 2025-12-31 records with valid currency names
    if (recordDate !== '2025-12-31' || !currencyName) {
      skippedCount++;
      continue;
    }

    const rate = parseFloat(exchangeRateStr);
    if (isNaN(rate)) {
      console.warn(`⚠️  Skipping ${currencyName}: invalid exchange rate "${exchangeRateStr}"`);
      skippedCount++;
      continue;
    }

    // Add to map (if duplicate, keep first occurrence)
    if (!exchangeRates.has(currencyName)) {
      exchangeRates.set(currencyName, {
        currencyName,
        rate,
        effectiveDate
      });
      processedCount++;
    }
  }

  // Add USD as a special case (rate = 1.0)
  if (!exchangeRates.has('United States-Dollar')) {
    exchangeRates.set('United States-Dollar', {
      currencyName: 'United States-Dollar',
      rate: 1.0,
      effectiveDate: '2025-12-31'
    });
    processedCount++;
  }

  console.log(`✅ Processed ${processedCount} unique currencies`);
  console.log(`⏭️  Skipped ${skippedCount} rows`);

  // Generate TypeScript module
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'exchangeRates.ts');
  const outputDir = path.dirname(outputPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build the TypeScript content
  let tsContent = `/**
 * Exchange Rate Data - Auto-generated from CSV
 * Generated on: ${new Date().toISOString()}
 * Source: data/RprtRateXchgCln_with_ISO.csv
 * Data date: 2025-12-31
 * Currencies: ${processedCount}
 */

export interface ExchangeRateData {
  currencyName: string;
  rate: number; // 1 USD = rate units of foreign currency
  effectiveDate: string;
}

export const exchangeRates = new Map<string, ExchangeRateData>([
`;

  // Add all currencies
  const entries = Array.from(exchangeRates.entries());
  for (let i = 0; i < entries.length; i++) {
    const [currencyName, data] = entries[i];
    const isLast = i === entries.length - 1;
    tsContent += `  ['${currencyName.replace(/'/g, "\\'")}', ${JSON.stringify(data)}]${isLast ? '' : ','}\n`;
  }

  tsContent += `]);

/**
 * Get supported currency names
 */
export function getSupportedCurrencies(): string[] {
  return Array.from(exchangeRates.keys()).sort();
}

/**
 * Check if a currency is supported
 */
export function isCurrencySupported(currencyName: string): boolean {
  return exchangeRates.has(currencyName);
}
`;

  // Write the file
  fs.writeFileSync(outputPath, tsContent, 'utf-8');

  console.log(`✨ Generated: ${outputPath}`);
  console.log(`📦 Module size: ${(tsContent.length / 1024).toFixed(2)} KB`);
  console.log('');
  console.log('Sample currencies:');
  entries.slice(0, 5).forEach(([name, data]) => {
    console.log(`  - ${name}: ${data.rate}`);
  });
}

// Run the conversion
try {
  convertCSVToJSON();
  console.log('');
  console.log('✅ Conversion completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Conversion failed:', error);
  process.exit(1);
}
