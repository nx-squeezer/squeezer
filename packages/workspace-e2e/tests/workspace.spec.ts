import { ensureNxProject, readJson, runNxCommandAsync, uniq, checkFilesExist, readFile } from '@nrwl/nx-plugin/testing';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';
import { parse } from 'yaml';

import {
  ciFile,
  codecovDotFile,
  eslintConfigFile,
  eslintPluginPrettier,
  prettierPlugin,
  tsConfigDefault,
  tsConfigFile,
} from '@nx-squeezer/workspace';

const timeout = 120000;

describe('@nx-squeezer/workspace e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@nx-squeezer/workspace', 'dist/packages/workspace');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it(
    'should create workspace',
    async () => {
      const project = uniq('workspace');
      await runNxCommandAsync(`generate @nx-squeezer/workspace:workspace ${project}`);
      const result = await runNxCommandAsync(`build ${project}`);
      expect(result.stdout).toContain('Executor ran');
    },
    timeout
  );

  describe('prettier generator', () => {
    it(
      'should setup prettier with eslint',
      async () => {
        await runNxCommandAsync(`generate @nx-squeezer/workspace:prettier`);

        const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(eslintConfigFile);
        expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();
        expect(eslintConfig.overrides?.[0]).toStrictEqual({
          files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md', '*.html'],
          extends: ['plugin:prettier/recommended'],
          rules: {},
        });

        const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>('package.json');
        expect(packageJson.devDependencies?.[eslintPluginPrettier]).toBeDefined();
      },
      timeout
    );
  });

  describe('tsconfig generator', () => {
    it(
      'should setup default compiler options',
      async () => {
        await runNxCommandAsync(`generate @nx-squeezer/workspace:tsconfig`);

        const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tsConfigFile);

        for (const compilerOption in tsConfigDefault.compilerOptions) {
          expect(tsConfig.compilerOptions?.[compilerOption]).toBe(tsConfigDefault.compilerOptions[compilerOption]);
        }
      },
      timeout
    );
  });

  describe('github workflow generator', () => {
    it(
      'should setup GitHub CI workflow and add nx script to package.json',
      async () => {
        await runNxCommandAsync(`generate @nx-squeezer/workspace:github-workflow --useNxCloud`);

        expect(() => checkFilesExist(ciFile)).not.toThrow();

        const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>('package.json');
        expect(packageJson.scripts?.nx).toBe('nx');
      },
      timeout
    );
  });

  describe('eslint workflow generator', () => {
    it(
      'should setup eslint config',
      async () => {
        const flags = [
          'eslintRecommended',
          'sonarJs',
          'unusedImports',
          'typescriptRecommended',
          'deprecation',
          'importOrder',
        ]
          .map((flag) => `--${flag}`)
          .join(' ');

        await runNxCommandAsync(`generate @nx-squeezer/workspace:eslint ${flags}`);

        expect(() => checkFilesExist(ciFile)).not.toThrow();

        const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(eslintConfigFile);
        expect(eslintConfig.plugins).toStrictEqual([
          'prettier',
          'sonarjs',
          'unused-imports',
          '@typescript-eslint',
          '@delagen/deprecation',
          'import',
        ]);
        expect(eslintConfig.env).toStrictEqual({
          node: true,
          browser: true,
          es2022: true,
        });
        expect(eslintConfig.overrides).toStrictEqual([
          {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md', '*.html'],
            extends: ['plugin:prettier/recommended'],
            rules: {},
          },
          {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
            extends: ['eslint:recommended', 'plugin:sonarjs/recommended'],
            rules: {},
          },
          {
            files: ['*.ts', '*.tsx'],
            extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
            rules: {
              'unused-imports/no-unused-imports': 'error',
              '@typescript-eslint/explicit-member-accessibility': [
                'warn',
                {
                  accessibility: 'no-public',
                },
              ],
              '@typescript-eslint/no-explicit-any': ['off'],
              '@typescript-eslint/explicit-module-boundary-types': ['off'],
              '@typescript-eslint/ban-types': ['off'],
              '@delagen/deprecation/deprecation': 'error',
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
          },
        ]);
      },
      timeout
    );
  });

  describe('codecov workflow generator', () => {
    it(
      'should setup Codecov',
      async () => {
        await runNxCommandAsync(`generate @nx-squeezer/workspace:codecov`);

        expect(() => checkFilesExist(codecovDotFile)).not.toThrow();

        expect(parse(readFile(codecovDotFile))).toStrictEqual({
          comment: {
            layout: 'reach',
            behavior: 'new',
            require_changes: true,
          },
          coverage: {
            range: '0..100',
            round: 'nearest',
            precision: 1,
            status: {
              patch: {
                default: {
                  target: '50%',
                  threshold: '10%',
                },
              },
              project: {
                default: {
                  target: '50%',
                  threshold: '10%',
                },
              },
            },
          },
        });
      },
      timeout
    );
  });
});
