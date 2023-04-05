import type { Config } from 'jest';

const config: Config = {
  displayName: 'workspace-e2e',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/workspace-e2e',
  maxWorkers: 1,
};

export default config;
