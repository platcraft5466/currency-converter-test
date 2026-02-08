# APiClaude - Currency Converter API

[![Tests](https://github.com/platcraft5466/currency-converter-test/actions/workflows/test.yml/badge.svg)](https://github.com/platcraft5466/currency-converter-test/actions/workflows/test.yml)

A currency converter API built with Cloudflare Workers and TypeScript. Converts between USD and 168+ foreign currencies using Treasury exchange rate data.

## Features

- **Currency Conversion**: Convert between USD and 168+ currencies
- **Real Exchange Rates**: Uses US Treasury exchange rate data
- **Type-Safe**: Built with TypeScript for reliability
- **Fast & Global**: Deployed on Cloudflare's edge network
- **Well-Tested**: 67 comprehensive tests with 100% handler/worker coverage
- **CI/CD**: Automated testing on every pull request

## API Endpoints

### `GET /convert`
Convert currency amounts between USD and foreign currencies.

**Query Parameters:**
- `amount` (required): The amount to convert (positive number)
- `from` (required): Source currency full name (e.g., "United States-Dollar")
- `to` (required): Target currency full name (e.g., "Canada-Dollar")

**Constraints:**
- At least one currency must be USD
- Both currencies must be supported

**Example Request:**
```bash
curl "http://localhost:8787/convert?amount=100&from=United%20States-Dollar&to=Canada-Dollar"
```

**Success Response (200):**
```json
{
  "amount": 100,
  "from": "United States-Dollar",
  "to": "Canada-Dollar",
  "converted_amount": 136.90,
  "rate": 1.369,
  "timestamp": "2026-02-07T12:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid parameters",
  "message": "Amount must be a valid number",
  "details": {
    "amount": "Amount must be a valid number"
  }
}
```

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "uptime": "Workers are stateless - always ready!"
}
```

## Prerequisites

- Node.js v18.0.0+ (or latest LTS version)
- npm 8.0.0+

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate exchange rate data:**
   ```bash
   npm run prebuild
   ```

3. **Generate TypeScript types:**
   ```bash
   npm run types
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8787`

5. **Test the API:**
   ```bash
   curl "http://localhost:8787/convert?amount=100&from=United%20States-Dollar&to=Canada-Dollar"
   ```

## Development

### Local Development
```bash
npm run dev
```

Wrangler will start a local development server with hot reload. Any changes to `src/index.ts` will automatically trigger a rebuild.

### Type Checking
```bash
npm run type-check
```

Regenerates type definitions and runs TypeScript compiler in check-only mode.

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
```

**Test Coverage:**
- 67 total tests
- Unit tests: Handler (16), Utilities (39)
- Integration tests: Worker (12)
- 100% coverage for handler and worker layers

## Project Structure

```
.
├── src/
│   ├── index.ts                          # Worker entry point & routing
│   ├── types.ts                          # TypeScript type definitions
│   ├── handlers/
│   │   ├── convertHandler.ts             # Conversion endpoint handler
│   │   └── convertHandler.test.ts        # Handler unit tests (16 tests)
│   ├── utils/
│   │   ├── converter.ts                  # Conversion logic
│   │   ├── converter.test.ts             # Converter tests (14 tests)
│   │   ├── validation.ts                 # Request validation
│   │   └── validation.test.ts            # Validation tests (25 tests)
│   ├── data/
│   │   └── exchangeRates.ts              # Generated exchange rates (168 currencies)
│   └── index.test.ts                     # Integration tests (12 tests)
├── data/
│   └── RprtRateXchgCln_with_ISO.csv     # Treasury exchange rate data
├── scripts/
│   └── convert-csv-to-json.ts            # CSV to TypeScript converter
├── .github/
│   └── workflows/
│       └── test.yml                      # CI/CD pipeline
├── wrangler.jsonc                        # Wrangler configuration
├── vitest.config.ts                      # Vitest configuration
├── tsconfig.json                         # TypeScript configuration
├── package.json                          # Dependencies and scripts
└── README.md                             # This file
```

## Technology Stack

- **Runtime:** Cloudflare Workers (V8 isolates)
- **Language:** TypeScript 5.7.2
- **Testing:** Vitest 3.2.4
- **CLI:** Wrangler 3.91.0+
- **Bundler:** esbuild (via Wrangler)
- **CI/CD:** GitHub Actions

## Supported Currencies

The API supports conversions between USD and 168 currencies, including:
- Major currencies: EUR, GBP, JPY, CAD, AUD, CHF
- Asian currencies: CNY, INR, KRW, SGD, HKD, THB
- Latin American: MXN, BRL, ARS, CLP, COP
- And 150+ more...

All exchange rates are based on US Treasury data (as of 2025-12-31).

## License

MIT
