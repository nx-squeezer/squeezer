import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { readEsLintConfig, writeEsLintConfig } from '../core';
import generator from './generator';

const timeout = 10_000;

describe('@nx-squeezer/workspace eslint generator', () => {
  let tree: Tree;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await generator(tree, { eslintRecommended: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should apply eslint:recommended', async () => {
    await generator(tree, { eslintRecommended: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.overrides?.[0]).toStrictEqual({
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      extends: ['eslint:recommended'],
      rules: {},
    });
  });

  it('should apply sonarjs/recommended', async () => {
    await generator(tree, { sonarJs: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes('sonarjs')).toBeTruthy();
    expect(eslintConfig.overrides?.[0]).toStrictEqual({
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      extends: ['plugin:sonarjs/recommended'],
      rules: {},
    });
  });

  it('should apply unused imports', async () => {
    await generator(tree, { unusedImports: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes('unused-imports')).toBeTruthy();
    expect(eslintConfig.overrides?.[0]).toStrictEqual({
      files: ['*.ts', '*.tsx'],
      rules: {
        'unused-imports/no-unused-imports': 'error',
      },
    });
  });

  it(
    'should apply @typescript-eslint/recommended',
    async () => {
      await generator(tree, { typescriptRecommended: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('@typescript-eslint')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        extends: ['plugin:@typescript-eslint/recommended'],
        rules: {
          '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],
          '@typescript-eslint/no-explicit-any': ['off'],
          '@typescript-eslint/explicit-module-boundary-types': ['off'],
          '@typescript-eslint/ban-types': ['off'],
        },
      });
    },
    timeout
  );

  it(
    'should apply @delagen/deprecation',
    async () => {
      await generator(tree, { deprecation: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('@delagen/deprecation')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        rules: {
          '@delagen/deprecation/deprecation': 'error',
        },
      });
    },
    timeout
  );

  it(
    'should apply import order',
    async () => {
      await generator(tree, { importOrder: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('import')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        extends: ['plugin:import/recommended', 'plugin:import/typescript'],
        rules: {
          'import/order': [
            'error',
            {
              pathGroups: [
                {
                  pattern: '@nx-*/**',
                  group: 'internal',
                  position: 'before',
                },
              ],
              groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
              pathGroupsExcludedImportTypes: [],
              'newlines-between': 'always',
              alphabetize: {
                order: 'asc',
                caseInsensitive: true,
              },
            },
          ],
          'import/no-unresolved': ['off'],
        },
        settings: {
          'import/resolver': {
            node: {
              extensions: ['.js', '.jsx', '.ts', '.tsx'],
            },
            typescript: {},
          },
        },
      });
    },
    timeout
  );
});
