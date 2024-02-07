import { Tree } from '@nx/devkit';

import { exec } from '../exec';

/**
 * Task that runs prettier in a workspace for all projects fixing the issues.
 */
export function formatWorkspaceTask(tree: Tree): void {
  const { error } = exec('npx', ['prettier', '.', '--write'], { cwd: tree.root });

  if (error != null) {
    console.error(`Could not format files in path: ${tree.root}`);
  }
}
