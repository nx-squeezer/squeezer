import { formatFiles, installPackagesTask, readJson, Tree, writeJson } from '@nx/devkit';

import {
  addHuskyToPackageJson,
  addDevDependencyToPackageJson,
  installHuskyTask,
  addHuskyHook,
} from '@nx-squeezer/devkit';

import {
  commitlintCli,
  CommitlintConfig,
  commitlintConfigConventional,
  commitlintConfigPath,
  commitlintDefaultConfig,
} from './commitlint';

/**
 * Nx generator to setup commitlint.
 */
export default async function commitlintGenerator(tree: Tree) {
  addHuskyToPackageJson(tree);
  addDevDependencyToPackageJson(tree, commitlintCli);
  addDevDependencyToPackageJson(tree, commitlintConfigConventional);

  const existingConfiguration: Partial<CommitlintConfig> = tree.exists(commitlintConfigPath)
    ? readJson(tree, commitlintConfigPath)
    : {};

  writeJson(tree, commitlintConfigPath, { ...existingConfiguration, ...commitlintDefaultConfig });
  addHuskyHook(tree, 'commit-msg', 'npx --no-install commitlint --edit $1');

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installHuskyTask(tree);
  };
}
