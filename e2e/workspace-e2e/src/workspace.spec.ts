import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { basename, dirname, parse } from 'path';

import { checkFilesExist, readFile, readJson, tmpProjPath, updateFile } from '@nx/plugin/testing';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

import { ciFile, huskyPath, joinNormalize, readmeFile } from '@nx-squeezer/devkit';
import {
  CommitlintConfig,
  LintStagedConfig,
  codecovDotFile,
  commitlintConfigPath,
  commitlintDefaultConfig,
  deprecationRule,
  esLintRule,
  eslintConfigFile,
  eslintPluginPrettier,
  importOrderRule,
  lintStagedConfigPath,
  lintStagedDefaultConfig,
  prettierConfigJsonFile,
  prettierPlugin,
  sonarJSRule,
  tsConfigDefault,
  tsConfigFile,
  typescriptRule,
  unusedImportsRule,
} from '@nx-squeezer/workspace';

describe('workspace', () => {
  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();

    // The plugin has been built and published to a local registry in the jest globalSetup
    // Install the plugin built with the latest source code into the test repo
    execSync(`npm install @nx-squeezer/workspace@e2e`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });
    execSync(`npm install @nx-squeezer/devkit@e2e`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });
    execSync(`npm install prettier@3 --save-dev`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });
    execSync(`npx nx generate @nx/js:lib mylib --unitTestRunner=jest --bundler=tsc`, {
      cwd: projectDirectory,
      stdio: 'inherit',
      env: process.env,
    });
  });

  afterAll(() => {
    // Cleanup the test project
    rmSync(projectDirectory, { recursive: true, force: true });
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('npm ls @nx-squeezer/workspace', { cwd: projectDirectory, stdio: 'inherit' });
  });

  describe('prettier generator', () => {
    it('should setup prettier with eslint', async () => {
      execSync('npx nx generate @nx-squeezer/workspace:prettier', { cwd: projectDirectory, stdio: 'inherit' });

      const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(eslintConfigFile);
      expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();
      expect(eslintConfig.overrides?.[eslintConfig.overrides.length - 1]).toStrictEqual({
        files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.html'],
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
    it('should setup default compiler options', () => {
      updateFile(tsConfigFile, JSON.stringify({ compilerOptions: {} }));

      execSync('npx nx generate @nx-squeezer/workspace:tsconfig', { cwd: projectDirectory, stdio: 'inherit' });

      const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tsConfigFile);

      for (const compilerOption in tsConfigDefault.compilerOptions) {
        expect(tsConfig.compilerOptions?.[compilerOption]).toBe(tsConfigDefault.compilerOptions[compilerOption]);
      }
    });
  });

  describe('github workflow generator', () => {
    it('should setup GitHub CI workflow and add nx script to package.json', () => {
      execSync('npx nx generate @nx-squeezer/workspace:github-workflow --useNxCloud', {
        cwd: projectDirectory,
        stdio: 'inherit',
      });

      expect(() => checkFilesExist(ciFile)).not.toThrow();

      const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>('package.json');
      expect(packageJson.scripts?.nx).toBe('nx');
    });
  });

  describe('eslint workflow generator', () => {
    it('should setup eslint config', () => {
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

      execSync(`npx nx generate @nx-squeezer/workspace:eslint ${flags}`, { cwd: projectDirectory, stdio: 'inherit' });

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
    it('should setup Codecov', () => {
      execSync(`npx nx generate @nx-squeezer/workspace:codecov`, { cwd: projectDirectory, stdio: 'inherit' });

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
    it('should add contributors image to readme', () => {
      execSync(`npx nx generate @nx-squeezer/workspace:contributors`, { cwd: projectDirectory, stdio: 'inherit' });

      const readme = readFile(readmeFile);

      expect(readme).toContain(`## Contributors`);
    });
  });

  describe('lint-staged workflow generator', () => {
    it('should create lint-staged configuration and husky hook', () => {
      execSync(`git init`, { cwd: projectDirectory, stdio: 'inherit' });

      execSync(`npx nx generate @nx-squeezer/workspace:lint-staged`, { cwd: projectDirectory, stdio: 'inherit' });

      const lintStagedConfig = readJson<LintStagedConfig>(lintStagedConfigPath);
      expect(lintStagedConfig).toStrictEqual(lintStagedDefaultConfig);

      const preCommitHook = readFile(joinNormalize(huskyPath, 'pre-commit'));
      expect(preCommitHook).toContain('npx lint-staged');
    });
  });

  describe('commitlint workflow generator', () => {
    it('should create commitlint configuration and husky hook', () => {
      execSync(`git init`, { cwd: projectDirectory, stdio: 'inherit' });

      execSync(`npx nx generate @nx-squeezer/workspace:commitlint`, { cwd: projectDirectory, stdio: 'inherit' });

      const commitlintConfig = readJson<CommitlintConfig>(commitlintConfigPath);
      expect(commitlintConfig).toStrictEqual(commitlintDefaultConfig);

      const commitMsgHook = readFile(joinNormalize(huskyPath, 'commit-msg'));
      expect(commitMsgHook).toContain('npx --no-install commitlint --edit $1');
    });
  });
});

/**
 * Creates a test project with create-nx-workspace and installs the plugin
 * @returns The directory where the test project was created
 */
function createTestProject() {
  const projectDirectory = tmpProjPath();
  const projectName = basename(projectDirectory);

  // Ensure projectDirectory is empty
  rmSync(projectDirectory, { recursive: true, force: true });
  mkdirSync(dirname(projectDirectory), { recursive: true });

  execSync(`npx --yes create-nx-workspace@latest ${projectName} --preset ts --nxCloud=skip --no-interactive`, {
    cwd: dirname(projectDirectory),
    stdio: 'inherit',
    env: process.env,
  });
  console.log(`Created test project in "${projectDirectory}"`);

  return projectDirectory;
}
