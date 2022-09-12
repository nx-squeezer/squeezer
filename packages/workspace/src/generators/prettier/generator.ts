import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  readJson,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';
import {
  addEsLintRules,
  formatWorkspaceTask,
  getNpmPackageVersion,
  lintWorkspaceTask,
  readEsLintConfig,
  writeEsLintConfig,
  isEsLintPluginPresent,
  addEsLintPlugin,
} from '../core';

import { prettierDefaultConfig } from './prettier-default-config';

export const prettierPlugin = 'prettier';
export const eslintPluginPrettier = 'eslint-plugin-prettier';
export const prettierConfigFile = '.prettierrc';
export const prettierConfigJsonFile = '.prettierrc.json';

export default async function (tree: Tree) {
  setPrettierConfig(tree);

  let eslintConfig: JSONSchemaForESLintConfigurationFiles = readEsLintConfig(tree);
  if (isEsLintPluginPresent(eslintConfig, prettierPlugin)) {
    return;
  }
  eslintConfig = addEsLintPlugin(eslintConfig, prettierPlugin, '@nrwl/nx');
  eslintConfig = addEsLintRules(eslintConfig, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md', '*.html'],
    extends: ['plugin:prettier/recommended'],
    rules: {},
  });

  writeEsLintConfig(tree, eslintConfig);

  addDependenciesToPackageJson(
    tree,
    {},
    { [eslintPluginPrettier]: getNpmPackageVersion(eslintPluginPrettier) ?? ' latest' }
  );
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
    formatWorkspaceTask(tree);
  };
}

function setPrettierConfig(tree: Tree): void {
  if (tree.exists(prettierConfigJsonFile)) {
    return;
  }

  if (!tree.exists(prettierConfigFile)) {
    writeJson(tree, prettierConfigFile, {});
  }

  let prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(tree, prettierConfigFile);
  prettierConfig = { ...prettierDefaultConfig, ...prettierConfig };

  writeJson(tree, prettierConfigFile, prettierConfig);
  tree.rename(prettierConfigFile, prettierConfigJsonFile);
}
