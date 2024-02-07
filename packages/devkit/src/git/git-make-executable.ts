import { Tree } from '@nx/devkit';

import { exec } from '../exec';

/**
 * Task that makes a file executable in the git index.
 */
export function gitMakeExecutable(tree: Tree, file: string): void {
  const { error } = exec('git', ['update-index', '--chmod=+x', file], { cwd: tree.root });

  if (error != null) {
    throw new Error(`Could not add execution permissions to git index for file: ${file}`);
  }
}
