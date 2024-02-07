import { Tree } from '@nx/devkit';

import { exec } from '../exec';
import { addDevDependencyToPackageJson, addScriptToPackageJson } from '../package-json';
import { joinNormalize } from '../path';

/** Husky package name. */
export const husky = 'husky';

/** Path where husky hooks are saved. */
export const huskyPath = '.husky';

/** Usual commit hooks. */
export type HuskyHooks = 'pre-commit' | 'commit-msg';

/** Generator that adds Husky to package.json */
export function addHuskyToPackageJson(tree: Tree) {
  addDevDependencyToPackageJson(tree, husky);
  addScriptToPackageJson(tree, 'prepare', 'husky');
}

/**
 * Task that installs husky.
 */
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

/**
 * Generator that adds a husky hook.
 */
export function addHuskyHook(tree: Tree, hook: HuskyHooks, command: string) {
  const hookPath: string = joinNormalize(huskyPath, hook);

  const huskyContent: string[] = tree.read(hookPath)?.toString().split('\n') ?? [];
  if (huskyContent.includes(command)) {
    console.log(`Command "${command}" already added to ${hook} husky hook.`);
    return;
  }

  console.log(`Adding husky hook ${hook} with command "${command}"`);
  huskyContent.push(command);
  tree.write(hookPath, huskyContent.join('\n'));
}
