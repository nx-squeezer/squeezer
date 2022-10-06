import { addProjectConfiguration, installPackagesTask, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { eslintConfigFile, lintWorkspaceTask, readEsLintConfig, writeEsLintConfig } from '../core';
import generator from './generator';
import schematic from './generator.compat';

const timeout = 10_000;

jest.mock('../core', () => ({
  ...jest.requireActual('../core'),
  lintWorkspaceTask: jest.fn(),
}));

jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual('@nrwl/devkit'),
  installPackagesTask: jest.fn(),
}));

describe('@nx-squeezer/workspace eslint generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await generator(tree, {});

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof schematic({})).toBe('function');
  });

  it('should run tasks', async () => {
    const tasks = await generator(tree, {});

    tasks();

    expect(lintWorkspaceTask).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
  });

  it('should apply eslint:recommended', async () => {
    await generator(tree, { eslintRecommended: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.overrides?.[0]).toStrictEqual({
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      extends: ['eslint:recommended'],
      rules: {},
    });
    expect(eslintConfig.env).toStrictEqual({ node: true, browser: true, es2022: true });
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
      addLibraries();

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
      expect(readEsLintConfig(tree, `libs/lib1/${eslintConfigFile}`).overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: ['libs/lib1/tsconfig.*?.json'] },
      });
    },
    timeout
  );

  it(
    'should apply @delagen/deprecation',
    async () => {
      addLibraries();

      await generator(tree, { deprecation: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('@delagen/deprecation')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        rules: {
          '@delagen/deprecation/deprecation': 'error',
        },
      });
      expect(readEsLintConfig(tree, `libs/lib1/${eslintConfigFile}`).overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: ['libs/lib1/tsconfig.*?.json'] },
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

  function addLibraries() {
    addProjectConfiguration(tree, 'lib1', {
      root: 'libs/lib1',
      sourceRoot: 'libs/lib1/src',
    });
    writeEsLintConfig(tree, {}, `libs/lib1/${eslintConfigFile}`);

    addProjectConfiguration(tree, 'lib2', {
      root: 'libs/lib2',
      sourceRoot: 'libs/lib2/src',
    });
  }
});
