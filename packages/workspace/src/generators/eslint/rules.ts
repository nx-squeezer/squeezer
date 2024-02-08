import { EsLintConfigurationOverrideRule } from './eslint-config';

/**
 * ESLint recommended rule.
 */
export const esLintRule: EsLintConfigurationOverrideRule = {
  files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  extends: ['eslint:recommended'],
  rules: {},
};

/**
 * ESLint SonarJS rule.
 */
export const sonarJSRule: EsLintConfigurationOverrideRule = {
  files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  extends: ['plugin:sonarjs/recommended'],
  rules: {},
};

/**
 * ESLint unused imports rule.
 */
export const unusedImportsRule: EsLintConfigurationOverrideRule = {
  files: ['*.ts', '*.tsx'],
  rules: {
    'unused-imports/no-unused-imports': 'error',
  },
};

/**
 * ESLint typescript rule.
 */
export const typescriptRule: EsLintConfigurationOverrideRule = {
  files: ['*.ts', '*.tsx'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/ban-types': ['off'],
  },
};

/**
 * ESLint deprecation rule.
 */
export const deprecationRule: EsLintConfigurationOverrideRule = {
  files: ['*.ts', '*.tsx'],
  rules: {
    'deprecation/deprecation': 'error',
  },
};

/**
 * ESLint import order rule.
 */
export const importOrderRule: EsLintConfigurationOverrideRule = {
  files: ['*.ts', '*.tsx'],
  extends: ['plugin:import/recommended', 'plugin:import/typescript'],
  rules: {
    'import/order': [
      'error',
      {
        pathGroups: [{ pattern: '@nx-*/**', group: 'internal', position: 'before' }],
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        pathGroupsExcludedImportTypes: [],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': ['off'],
  },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      typescript: {},
    },
  },
};
