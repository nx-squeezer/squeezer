import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';

import { slash } from './slash';

export function formatWorkspaceTask(tree: Tree): void {
  try {
    execSync('npx prettier . --write', {
      cwd: slash(tree.root),
      stdio: [0, 1, 2],
    });
  } catch (err) {
    console.error(`Could not format files in path: ${tree.root}`);
    console.error(err);
    return;
  }
}
