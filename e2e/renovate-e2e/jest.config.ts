import type { Config } from 'jest';

const config: Config = {
  displayName: 'renovate-e2e',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['./setup-jest.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  maxWorkers: 1,
};

export default config;
