import { Tree } from '@nrwl/devkit';

import { exec } from '../exec';

export function formatWorkspaceTask(tree: Tree): void {
  const { error } = exec('npx', ['prettier', '.', '--write'], { cwd: tree.root });

  if (error != null) {
    console.error(`Could not format files in path: ${tree.root}`);
  }
}
