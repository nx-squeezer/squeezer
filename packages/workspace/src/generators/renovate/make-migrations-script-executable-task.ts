import { Tree } from '@nx/devkit';

import { gitMakeExecutable } from '@nx-squeezer/devkit';

import { renovateCreateMigrationsFile } from './renovate';

export function makeMigrationsScriptExecutableTask(tree: Tree): boolean {
  try {
    gitMakeExecutable(tree, renovateCreateMigrationsFile);
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
}
