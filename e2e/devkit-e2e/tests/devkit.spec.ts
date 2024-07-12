import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { basename, dirname } from 'path';

import { tmpProjPath } from '@nx/plugin/testing';

describe('@nx-squeezer/devkit e2e', () => {
  let projectDirectory: string;

  beforeAll(() => {
    projectDirectory = createTestProject();

    // The plugin has been built and published to a local registry in the jest globalSetup
    // Install the plugin built with the latest source code into the test repo
    execSync(`npm install @nx-squeezer/devkit@e2e`, { cwd: projectDirectory, stdio: 'inherit', env: process.env });
  });

  afterAll(() => {
    // Cleanup the test project
    rmSync(projectDirectory, { recursive: true, force: true });
  });

  it('should be installed', () => {
    // npm ls will fail if the package is not installed properly
    execSync('npm ls @nx-squeezer/devkit', { cwd: projectDirectory, stdio: 'inherit' });
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
