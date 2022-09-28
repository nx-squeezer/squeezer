import { checkFilesExist, ensureNxProject, runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';

describe('renovate e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    runNxCommandAsync('reset');
    ensureNxProject('@nx-squeezer/renovate', 'dist/packages/renovate');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('renovate');
      await runNxCommandAsync(`generate @nx-squeezer/renovate:renovate ${project} --directory subdir`);
      expect(() => checkFilesExist(`libs/subdir/${project}/src/index.ts`)).not.toThrow();
    }, 120000);
  });
});
