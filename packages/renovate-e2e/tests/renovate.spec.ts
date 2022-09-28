import { ensureNxProject, runNxCommandAsync } from '@nrwl/nx-plugin/testing';

describe('renovate e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@nx-squeezer/renovate', 'dist/packages/renovate');
  });

  afterAll(async () => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    await runNxCommandAsync('reset');
  });

  it('should execute successfully', async () => {
    await expect(runNxCommandAsync(`generate @nx-squeezer/renovate:renovate`)).resolves.toBeTruthy();
  }, 120000);
});
