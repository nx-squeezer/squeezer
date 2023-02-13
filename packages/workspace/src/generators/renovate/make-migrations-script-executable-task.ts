import { Tree } from '@nrwl/devkit';

import { renovateCreateMigrationsFile } from './renovate';
import { gitMakeExecutable } from '../lib';

export function makeMigrationsScriptExecutableTask(tree: Tree): boolean {
  try {
    gitMakeExecutable(tree, renovateCreateMigrationsFile);
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
}
