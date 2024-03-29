/* istanbul ignore file */

import { execSync } from 'child_process';

import { getPackageManagerCommand } from '@nx/devkit';
import { tmpProjPath } from '@nx/plugin/testing';

/**
 * Runs command to install dependencies.
 */
export function runPackageManagerInstall(path = tmpProjPath()): void {
  const pmc = getPackageManagerCommand();
  execSync(pmc.install, {
    cwd: path,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
}
