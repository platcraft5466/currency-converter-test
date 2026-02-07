# APiClaude - Hello World API

A simple Hello World API built with Cloudflare Workers and TypeScript.

## Features

- HTTP GET endpoint returning JSON responses
- TypeScript with full type safety
- Local development with hot reload
- Production-ready deployment to Cloudflare's global network

## API Endpoints

### `GET /` or `GET /hello`
Returns a Hello World message with metadata.

**Response:**
```json
{
  "message": "Hello World!",
  "timestamp": "2026-02-06T12:00:00.000Z",
  "worker": "APiClaude Hello World API",
  "version": "1.0.0"
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

2. **Generate TypeScript types:**
   ```bash
   npm run types
   ```

3. **Run locally:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:8787`

4. **Test the API:**
   ```bash
   curl http://localhost:8787/hello
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

## Project Structure

```
.
├── src/
│   └── index.ts              # Worker entry point
├── wrangler.jsonc            # Wrangler configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Technology Stack

- **Runtime:** Cloudflare Workers (V8 isolates)
- **Language:** TypeScript 5.7.2
- **CLI:** Wrangler 3.91.0+
- **Bundler:** esbuild (via Wrangler)

## License

MIT
