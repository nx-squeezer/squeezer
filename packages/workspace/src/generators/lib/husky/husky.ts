import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';

import { addDevDependencyToPackageJson, addScriptToPackageJson } from '../package-json';
import { joinNormalize } from '../path';

export const husky = 'husky';
export const huskyPath = '.husky';
export type HuskyHooks = 'pre-commit';

export function addHuskyToPackageJson(tree: Tree) {
  addDevDependencyToPackageJson(tree, husky);
  addScriptToPackageJson(tree, 'prepare', 'husky install');
}

export function installHuskyTask(tree: Tree) {
  if (tree.exists(huskyPath)) {
    console.log(`Husky already installed, skipping installation.`);
  } else {
    try {
      console.log(`Installing husky...`);
      execSync(`npx husky install`, {
        cwd: joinNormalize(tree.root),
        stdio: [0, 1, 2],
      });
    } catch (err) {
      console.error(`Could not install husky in path: ${tree.root}`);
      console.error(err);
    }
  }
}

export function addHuskyHookTask(tree: Tree, hook: HuskyHooks, command: string) {
  const hookPath: string = joinNormalize(huskyPath, hook);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (tree.exists(hookPath) && tree.read(hookPath)!.toString().split('\n').includes(command)) {
    console.log(`Command "${command}" already added to ${hook} husky hook.`);
    return;
  }

  try {
    console.log(`Adding husky hook ${hook} with command "${command}"`);
    execSync(`npx husky add ${huskyPath}/${hook} "${command}"`, {
      cwd: joinNormalize(tree.root),
      stdio: [0, 1, 2],
    });
  } catch (err) {
    console.error(`Could not add husky hook in path: ${tree.root}`);
    console.error(err);
  }
}
