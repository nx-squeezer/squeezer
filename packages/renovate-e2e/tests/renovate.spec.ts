import { runNxCommandAsync, checkFilesExist, updateFile } from '@nx/plugin/testing';

import { securityFile, ensureNxProject, ciFile } from '@nx-squeezer/devkit';
import { renovateCiFile, renovateConfigFile, renovatePresets, renovateFile } from '@nx-squeezer/renovate';

jest.setTimeout(120_000);

describe('@nx-squeezer/renovate e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependent on one another.
  beforeAll(async () => {
    // https://github.com/nrwl/nx/issues/4851#issuecomment-822604801
    await ensureNxProject('renovate');
    updateFile(
      ciFile,
      `
name: CI
on:
  push:
    branches:
      - main
    `
    );
  });

  afterAll(async () => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    await runNxCommandAsync('reset');
  });

  it('should setup Renovate CI workflow and add presets', async () => {
    await runNxCommandAsync(`generate @nx-squeezer/renovate:setup --useNxCloud --local --assignee=samuelfernandez`);

    expect(() => checkFilesExist(renovateCiFile)).not.toThrow();
    expect(() => checkFilesExist(renovateConfigFile)).not.toThrow();
    expect(() => checkFilesExist(renovateFile)).not.toThrow();
    expect(() => checkFilesExist(securityFile)).not.toThrow();

    renovatePresets.forEach((preset) => {
      expect(() => checkFilesExist(preset)).not.toThrow();
    });
  });
});
