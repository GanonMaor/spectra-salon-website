/**
 * jest.integration.config.js
 * ─────────────────────────────────────────────────────────────────────────
 * Separate Jest configuration for integration tests that require a real
 * database connection (TEST_DATABASE_URL) and run in Node environment.
 *
 * Run with:
 *   TEST_DATABASE_URL=postgresql://... npx jest --config jest.integration.config.js
 *
 * These tests are intentionally excluded from the default `npm test` run
 * to prevent accidental connection to production databases.
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",

  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
      useESM: true,
    },
  },

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testMatch: [
    "**/__tests__/**/*integration*.(ts|tsx)",
    "**/__tests__/**/*integration*.(js)",
  ],

  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
        useESM: true,
      },
    ],
  },

  // No setupFilesAfterEnach here — integration tests don't need jsdom mocks
};
