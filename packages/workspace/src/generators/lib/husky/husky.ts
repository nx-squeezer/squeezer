import { Tree } from '@nrwl/devkit';

import { exec } from '../exec';
import { addDevDependencyToPackageJson, addScriptToPackageJson } from '../package-json';
import { joinNormalize } from '../path';

export const husky = 'husky';
export const huskyPath = '.husky';
export type HuskyHooks = 'pre-commit' | 'commit-msg';

export function addHuskyToPackageJson(tree: Tree) {
  addDevDependencyToPackageJson(tree, husky);
  addScriptToPackageJson(tree, 'prepare', 'husky install');
}

export function installHuskyTask(tree: Tree) {
  if (tree.exists(huskyPath)) {
    console.log(`Husky already installed, skipping installation.`);
  } else {
    console.log(`Installing husky...`);
    const { error } = exec('npx', ['husky', 'install'], { cwd: tree.root });

    if (error != null) {
      console.error(`Could not install husky in path: ${tree.root}`);
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

  console.log(`Adding husky hook ${hook} with command "${command}"`);
  const { error } = exec('npx', ['husky', 'add', `${huskyPath}/${hook}`, command], { cwd: tree.root });

  if (error != null) {
    console.error(`Could not add husky hook in path: ${tree.root}`);
  }
}
