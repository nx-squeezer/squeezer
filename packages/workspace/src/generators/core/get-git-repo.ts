import { Tree } from '@nrwl/devkit';
import { execSync } from 'child_process';
import { join } from 'path';

export function getGitRepo(tree: Tree): string | null {
  try {
    const output = execSync(`git config --get remote.origin.url`, {
      stdio: ['pipe', 'pipe', 'ignore'],
      cwd: join(tree.root, ''),
    });

    if (output) {
      return output
        .toString()
        .trim()
        .replace(/^\n*|\n*$/g, '')
        .replace(/\.git$/i, '');
    }
  } catch (err) {
    return null;
  }
  return null;
}
