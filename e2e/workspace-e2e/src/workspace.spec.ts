import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { basename, dirname } from 'path';

import { readJson, tmpProjPath } from '@nx/plugin/testing';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';

import { eslintConfigFile, eslintPluginPrettier, prettierConfigJsonFile, prettierPlugin } from '@nx-squeezer/workspace';

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
    execSync(`npx nx reset`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });
    rmSync(projectDirectory, { recursive: true, force: true });
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('npm ls @nx-squeezer/workspace', { cwd: projectDirectory, stdio: 'inherit' });
  });

  describe('prettier generator', () => {
    it('should setup prettier with eslint', async () => {
      execSync('npx nx generate @nx-squeezer/workspace:prettier', {
        cwd: projectDirectory,
        stdio: 'inherit',
        env: { NX_DAEMON: 'false' },
      });

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
