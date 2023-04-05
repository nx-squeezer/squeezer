import { execSync } from 'child_process';

import { getPackageManagerCommand } from '@nrwl/devkit';
import { tmpProjPath } from '@nrwl/nx-plugin/testing';

export function runPackageManagerInstall(path = tmpProjPath()): void {
  const pmc = getPackageManagerCommand();
  execSync(pmc.install, {
    cwd: path,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
}
