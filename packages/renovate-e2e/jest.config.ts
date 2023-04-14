import type { Config } from 'jest';

const config: Config = {
  displayName: 'renovate-e2e',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  maxWorkers: 1,
};

export default config;
