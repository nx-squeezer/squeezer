import { ensureNxProject, runNxCommandAsync } from '@nrwl/nx-plugin/testing';

jest.setTimeout(120_000);

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

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should execute successfully', async () => {
    expect(true).toBeTruthy();
  });
});
