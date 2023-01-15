import { formatFiles, installPackagesTask, readJson, Tree, writeJson } from '@nrwl/devkit';

import {
  commitlintCli,
  CommitlintConfig,
  commitlintConfigConventional,
  commitlintConfigPath,
  commitlintDefaultConfig,
} from './commitlint';
import { addHuskyToPackageJson, addDevDependencyToPackageJson, installHuskyTask, addHuskyHookTask } from '../lib';

export async function commitlintGenerator(tree: Tree) {
  addHuskyToPackageJson(tree);
  addDevDependencyToPackageJson(tree, commitlintCli);
  addDevDependencyToPackageJson(tree, commitlintConfigConventional);

  const existingConfiguration: Partial<CommitlintConfig> = tree.exists(commitlintConfigPath)
    ? readJson(tree, commitlintConfigPath)
    : {};

  writeJson(tree, commitlintConfigPath, { ...existingConfiguration, ...commitlintDefaultConfig });

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    installHuskyTask(tree);
    addHuskyHookTask(tree, 'commit-msg', 'npx --no-install commitlint --edit $1');
  };
}
