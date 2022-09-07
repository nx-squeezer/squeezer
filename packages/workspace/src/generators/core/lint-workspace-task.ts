import { Tree } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { join } from 'path';

export function lintWorkspaceTask(tree: Tree): string | null {
  try {
    execSync('npx nx run-many --target=lint --parallel=2 --all --fix', {
      cwd: join(tree.root, ''),
      stdio: [0, 1, 2],
    });
  } catch (err) {
    return null;
  }
  return null;
}
