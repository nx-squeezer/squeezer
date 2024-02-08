import { formatFiles, installPackagesTask, Tree, readJson, writeJson } from '@nx/devkit';

import {
  addHuskyToPackageJson,
  addDevDependencyToPackageJson,
  installHuskyTask,
  addHuskyHook,
} from '@nx-squeezer/devkit';

import { lintStaged, LintStagedConfig, lintStagedConfigPath, lintStagedDefaultConfig } from './lint-staged';

/**
 * Nx generator to setup lint-staged and husky.
 */
export default async function lintStagedGenerator(tree: Tree) {
  addHuskyToPackageJson(tree);
  addDevDependencyToPackageJson(tree, lintStaged);

  const existingConfiguration: LintStagedConfig = tree.exists(lintStagedConfigPath)
    ? readJson(tree, lintStagedConfigPath)
    : {};

  writeJson(tree, lintStagedConfigPath, { ...existingConfiguration, ...lintStagedDefaultConfig });
  addHuskyHook(tree, 'pre-commit', 'npx lint-staged');

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installHuskyTask(tree);
  };
}
