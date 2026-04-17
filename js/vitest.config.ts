import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.bench.ts',
        // lightener-curve-card.ts is the god-file under active extraction (PR-B).
        // Its render methods are covered by regression and lightener-panel tests
        // indirectly, but not by unit tests. Exclude from the gate until PR-B
        // shrinks it and raises coverage organically.
        'src/lightener-curve-card.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
      // Floor, not ratchet: baseline is 81/71/82/79 with the card excluded.
      // Set 3-6pp below to allow legitimate refactor churn without false CI fails.
      // Raise as PR-B extracts save-lifecycle and brightness helpers.
      thresholds: {
        lines: 75,
        branches: 65,
        functions: 75,
        statements: 75,
      },
    },
  },
});
