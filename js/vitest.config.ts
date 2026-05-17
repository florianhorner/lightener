import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['playwright/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.bench.ts',
        // lightener-curve-card.ts is the god-file under active extraction.
        // Its render methods are covered by regression and lightener-panel tests
        // indirectly, but not by unit tests. PR-A extracted per-component tests;
        // PR-B extracted the save-lifecycle reducer. Re-include when the card
        // is under 400 lines and can be covered directly.
        'src/lightener-curve-card.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      // Floor, not ratchet: baseline after coverage-improvement PR is
      // 87.14/79.34/88.46/84.86 (lines/branches/functions/statements) with
      // the card excluded. Set ~4pp below to allow legitimate refactor churn.
      thresholds: {
        lines: 83,
        branches: 75,
        functions: 84,
        statements: 81,
      },
    },
  },
});
