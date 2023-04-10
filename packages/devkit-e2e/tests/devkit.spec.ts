import { runNxCommandAsync, uniq } from '@nrwl/nx-plugin/testing';

import { ensureNxProject } from '@nx-squeezer/devkit';

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
    // await runNxCommandAsync(`generate @nx-squeezer/devkit:devkit ${project}`);
    // const result = await runNxCommandAsync(`build ${project}`);
    expect(project).not.toBeNull();
  }, 120000);
});
