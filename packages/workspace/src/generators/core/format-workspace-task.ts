import { Tree } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { join } from 'path';

export function formatWorkspaceTask(tree: Tree): string | null {
  try {
    execSync('npx prettier . --write', {
      cwd: join(tree.root, ''),
      stdio: [0, 1, 2],
    });
  } catch (err) {
    return null;
  }
  return null;
}
