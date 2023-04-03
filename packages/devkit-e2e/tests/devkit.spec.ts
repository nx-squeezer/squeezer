import { checkFilesExist, ensureNxProject, readJson, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';

describe('devkit e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@nx-squeezer/devkit', 'dist/packages/devkit');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create devkit', async () => {
    const project = uniq('devkit');
    await runNxCommandAsync(`generate @nx-squeezer/devkit:devkit ${project}`);
    const result = await runNxCommandAsync(`build ${project}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('devkit');
      await runNxCommandAsync(`generate @nx-squeezer/devkit:devkit ${project} --directory subdir`);
      expect(() => checkFilesExist(`libs/subdir/${project}/src/index.ts`)).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('devkit');
      ensureNxProject('@nx-squeezer/devkit', 'dist/packages/devkit');
      await runNxCommandAsync(`generate @nx-squeezer/devkit:devkit ${projectName} --tags e2etag,e2ePackage`);
      const project = readJson(`libs/${projectName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
