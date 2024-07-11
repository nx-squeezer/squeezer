/*import {
  readJson,
  runNxCommandAsync,
  checkFilesExist,
  readFile,
  runCommandAsync,
  updateFile,
} from '@nx/plugin/testing';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';
import { parse } from 'yaml';

import { readmeFile, joinNormalize, huskyPath, ensureNxProject, ciFile } from '@nx-squeezer/devkit';
import {
  codecovDotFile,
  eslintConfigFile,
  eslintPluginPrettier,
  prettierConfigJsonFile,
  prettierPlugin,
  tsConfigDefault,
  tsConfigFile,
  lintStagedConfigPath,
  LintStagedConfig,
  lintStagedDefaultConfig,
  CommitlintConfig,
  commitlintConfigPath,
  commitlintDefaultConfig,
  typescriptRule,
  importOrderRule,
  unusedImportsRule,
  deprecationRule,
  esLintRule,
  sonarJSRule,
} from '@nx-squeezer/workspace';

jest.setTimeout(120_000);

describe('@nx-squeezer/workspace e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependent on one another.
  beforeAll(async () => {
    // https://github.com/nrwl/nx/issues/4851#issuecomment-822604801
    await ensureNxProject('workspace');
  });

  afterAll(async () => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    await runNxCommandAsync('reset');
  });

  describe('prettier generator', () => {
    it('should setup prettier with eslint', async () => {
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

      expect(readJson<Exclude<SchemaForPrettierrc, string>>(prettierConfigJsonFile)).toStrictEqual({
        printWidth: 120,
        tabWidth: 2,
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'always',
        overrides: [
          {
            files: '*.html',
            options: {
              parser: 'html',
            },
          },
        ],
      });
    });
  });

  describe('tsconfig generator', () => {
    it('should setup default compiler options', async () => {
      updateFile(tsConfigFile, JSON.stringify({ compilerOptions: {} }));

      await runNxCommandAsync(`generate @nx-squeezer/workspace:tsconfig`);

      const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tsConfigFile);

      for (const compilerOption in tsConfigDefault.compilerOptions) {
        expect(tsConfig.compilerOptions?.[compilerOption]).toBe(tsConfigDefault.compilerOptions[compilerOption]);
      }
    });
  });

  describe('github workflow generator', () => {
    it('should setup GitHub CI workflow and add nx script to package.json', async () => {
      await runNxCommandAsync(`generate @nx-squeezer/workspace:github-workflow --useNxCloud`);

      expect(() => checkFilesExist(ciFile)).not.toThrow();

      const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>('package.json');
      expect(packageJson.scripts?.nx).toBe('nx');
    });
  });

  describe('eslint workflow generator', () => {
    it('should setup eslint config', async () => {
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
        'deprecation',
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
          extends: [...(esLintRule.extends ?? []), ...(sonarJSRule.extends ?? [])],
          rules: {},
        },
        {
          files: ['*.ts', '*.tsx'],
          extends: [...(typescriptRule.extends ?? []), ...(importOrderRule.extends ?? [])],
          rules: {
            ...unusedImportsRule.rules,
            ...typescriptRule.rules,
            ...deprecationRule.rules,
            ...importOrderRule.rules,
          },
          settings: {
            ...importOrderRule.settings,
          },
        },
      ]);
    });
  });

  describe('codecov workflow generator', () => {
    it('should setup Codecov', async () => {
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
    });
  });

  describe('contributors workflow generator', () => {
    it('should add contributors image to readme', async () => {
      await runNxCommandAsync(`generate @nx-squeezer/workspace:contributors`);

      const readme = readFile(readmeFile);

      expect(readme).toContain(`## Contributors`);
    });
  });

  describe('lint-staged workflow generator', () => {
    it('should create lint-staged configuration and husky hook', async () => {
      await runCommandAsync('git init');

      await runNxCommandAsync(`generate @nx-squeezer/workspace:lint-staged`);

      const lintStagedConfig = readJson<LintStagedConfig>(lintStagedConfigPath);
      expect(lintStagedConfig).toStrictEqual(lintStagedDefaultConfig);

      const preCommitHook = readFile(joinNormalize(huskyPath, 'pre-commit'));
      expect(preCommitHook).toContain('npx lint-staged');
    });
  });

  describe('commitlint workflow generator', () => {
    it('should create commitlint configuration and husky hook', async () => {
      await runCommandAsync('git init');

      await runNxCommandAsync(`generate @nx-squeezer/workspace:commitlint`);

      const commitlintConfig = readJson<CommitlintConfig>(commitlintConfigPath);
      expect(commitlintConfig).toStrictEqual(commitlintDefaultConfig);

      const commitMsgHook = readFile(joinNormalize(huskyPath, 'commit-msg'));
      expect(commitMsgHook).toContain('npx --no-install commitlint --edit $1');
    });
  });
});
*/
