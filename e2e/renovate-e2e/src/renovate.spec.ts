import { execSync } from 'child_process';
import { basename, dirname } from 'path';

import { updateFile, tmpProjPath, checkFilesExist } from '@nx/plugin/testing';
import { rmSync, mkdirSync } from 'fs-extra';

import { ciFile, securityFile } from '@nx-squeezer/devkit';
import { renovateCiFile, renovateConfigFile, renovateFile, renovatePresets } from '@nx-squeezer/renovate';

describe('@nx-squeezer/renovate e2e', () => {
  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();

    // The plugin has been built and published to a local registry in the jest globalSetup
    // Install the plugin built with the latest source code into the test repo
    execSync(`npm install @nx-squeezer/renovate@e2e`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });
    execSync(`npm install @nx-squeezer/devkit@e2e`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });

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

  afterAll(() => {
    // Cleanup the test project
    rmSync(projectDirectory, { recursive: true, force: true });
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('npm ls @nx-squeezer/renovate', { cwd: projectDirectory, stdio: 'inherit' });
  });

  it('should setup Renovate CI workflow and add presets', () => {
    execSync('npx nx generate @nx-squeezer/renovate:setup --useNxCloud --local --assignee=samuelfernandez', {
      cwd: projectDirectory,
      stdio: 'inherit',
    });

    expect(() => checkFilesExist(renovateCiFile)).not.toThrow();
    expect(() => checkFilesExist(renovateConfigFile)).not.toThrow();
    expect(() => checkFilesExist(renovateFile)).not.toThrow();
    expect(() => checkFilesExist(securityFile)).not.toThrow();

    renovatePresets.forEach((preset) => {
      expect(() => checkFilesExist(preset)).not.toThrow();
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
