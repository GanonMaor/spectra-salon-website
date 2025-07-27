/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  
  // Use the Jest-specific TypeScript config
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.jest.json',
      useESM: true
    }
  },
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)'
  ],
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    'netlify/functions/**/*.(ts|js)',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  
  // Transform settings for ESM
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      useESM: true
    }]
  }
}; 