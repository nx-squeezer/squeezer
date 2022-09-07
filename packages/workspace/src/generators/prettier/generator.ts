import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  readJson,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { getNpmPackageVersion, lintWorkspaceTask } from '../core';

export const prettierPlugin = 'prettier';
export const eslintPluginPrettier = 'eslint-plugin-prettier';
export const eslintConfigFile = '.eslintrc.json';

export default async function (tree: Tree) {
  // Creates empty eslint config file
  if (!tree.exists(eslintConfigFile)) {
    writeJson(tree, eslintConfigFile, { root: true, ignorePatterns: ['**/*'] });
  }

  const eslint = readJson<JSONSchemaForESLintConfigurationFiles>(tree, eslintConfigFile);
  const plugins = eslint.plugins ?? [];

  // Early exit if already configured
  if (plugins.includes(prettierPlugin)) {
    return;
  }

  // Insert prettier after existing plugins
  const prettierPluginIndex = plugins.indexOf('@nrwl/nx');
  plugins.splice(prettierPluginIndex + 1, 0, prettierPlugin);
  eslint.plugins = plugins;

  // Configure overrides
  eslint.overrides = [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md'],
      extends: ['plugin:prettier/recommended'],
      rules: {},
    },
    ...(eslint.overrides ?? []),
  ];

  writeJson(tree, eslintConfigFile, eslint);

  // Add plugin to dev dependencies
  addDependenciesToPackageJson(tree, {}, { [eslintPluginPrettier]: getNpmPackageVersion(eslintPluginPrettier) });

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
  };
}
