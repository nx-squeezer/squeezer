import { Tree } from '@nrwl/devkit';

import { exec } from '../exec';

export function lintWorkspaceTask(tree: Tree): void {
  const { error } = exec('npx', ['nx', 'run-many', '--target=lint', '--parallel=2', '--all', '--fix'], {
    cwd: tree.root,
  });

  if (error != null) {
    console.error(`Could not lint projects in path: ${tree.root}`);
  }
}
