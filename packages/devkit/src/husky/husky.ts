import { Tree } from '@nx/devkit';

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
    const { error } = exec('npx', ['husky', 'init'], { cwd: tree.root });

    if (error != null) {
      console.error(`Could not install husky in path: ${tree.root}`);
    }
  }
}

export function addHuskyHookTask(tree: Tree, hook: HuskyHooks, command: string) {
  const hookPath: string = joinNormalize(huskyPath, hook);

  if (!tree.exists(hookPath)) {
    console.error(`Husky hook does not exist in path: ${tree.root}`);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const huskyContent: string[] = tree.read(hookPath)!.toString().split('\n');
  if (huskyContent.includes(command)) {
    console.log(`Command "${command}" already added to ${hook} husky hook.`);
    return;
  }

  console.log(`Adding husky hook ${hook} with command "${command}"`);
  huskyContent.push(command);
  tree.write(hookPath, huskyContent.join('\n'));
}
