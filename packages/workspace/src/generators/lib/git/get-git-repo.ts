import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';

import { joinNormalize } from '../path';

export function getGitRepo(tree: Tree): string | null {
  try {
    const output = execSync(`git config --get remote.origin.url`, {
      stdio: ['pipe', 'pipe', 'ignore'],
      cwd: joinNormalize(tree.root),
    });

    if (output) {
      return output
        .toString()
        .trim()
        .replace(/^\n*|\n*$/g, '')
        .replace(/\.git$/i, '');
    }
  } catch (err) {
    console.error(err);
  }
  console.error(`Could not resolve git repo remote url.`);
  return null;
}

export function getGitRepoSlug(tree: Tree): string | null {
  return getGitRepo(tree)?.replace(/^https:\/\/github.com\//, '') ?? null;
}
