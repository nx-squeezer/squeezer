import { formatFiles, installPackagesTask, Tree, readJson, writeJson } from '@nrwl/devkit';

import { lintStaged, LintStagedConfig, lintStagedConfigPath, lintStagedDefaultConfig } from './lint-staged';
import { addDevDependencyToPackageJson, addHuskyHookTask, addHuskyToPackageJson, installHuskyTask } from '../lib';

export async function lintStagedGenerator(tree: Tree) {
  addHuskyToPackageJson(tree);
  addDevDependencyToPackageJson(tree, lintStaged);

  const existingConfiguration: LintStagedConfig = tree.exists(lintStagedConfigPath)
    ? readJson(tree, lintStagedConfigPath)
    : {};

  writeJson(tree, lintStagedConfigPath, { ...existingConfiguration, ...lintStagedDefaultConfig });

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installHuskyTask(tree);
    addHuskyHookTask(tree, 'pre-commit', 'npx lint-staged');
  };
}
