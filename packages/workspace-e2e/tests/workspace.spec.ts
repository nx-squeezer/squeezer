import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { ensureNxProject, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';
import { eslintConfigFile, eslintPluginPrettier, prettierPlugin } from '@nx-squeezer/workspace';

import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

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
  /*
  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('workspace');
      await runNxCommandAsync(`generate @nx-squeezer/workspace:workspace ${project} --directory subdir`);
      expect(() => checkFilesExist(`libs/subdir/${project}/src/index.ts`)).not.toThrow();
    }, 120000);
  }); */

  describe('prettier generator', () => {
    it(
      'should setup prettier with eslint',
      async () => {
        await runNxCommandAsync(`generate @nx-squeezer/workspace:prettier`);

        const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(eslintConfigFile);
        expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();

        const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>('package.json');
        expect(packageJson.devDependencies?.[eslintPluginPrettier]).toBeDefined();
      },
      timeout
    );
  });
});
