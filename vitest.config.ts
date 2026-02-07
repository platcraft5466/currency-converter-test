import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'src/data/**', // Exclude generated data files
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    }
  }
});
