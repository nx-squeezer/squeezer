import { execSync } from 'child_process';
import { join } from 'path';

import { Tree } from '@nrwl/devkit';

export function formatWorkspaceTask(tree: Tree): void {
  try {
    execSync('npx prettier . --write', {
      cwd: join(tree.root, ''),
      stdio: [0, 1, 2],
    });
  } catch (err) {
    console.error(`Could not format files in path: ${tree.root}`);
    console.error(err);
    return;
  }
}
