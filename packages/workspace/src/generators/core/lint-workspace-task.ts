import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';

import { slash } from './slash';

export function lintWorkspaceTask(tree: Tree): void {
  try {
    execSync('npx nx run-many --target=lint --parallel=2 --all --fix', {
      cwd: slash(tree.root),
      stdio: [0, 1, 2],
    });
  } catch (err) {
    console.error(`Could not lint projects in path: ${tree.root}`);
    console.error(err);
    return;
  }
}
