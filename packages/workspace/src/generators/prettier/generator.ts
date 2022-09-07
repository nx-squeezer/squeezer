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
import { getNpmPackageVersion, lintWorkspaceTask } from '../core';
import { prettierDefaultConfig } from './prettier-default-config';

export const prettierPlugin = 'prettier';
export const eslintPluginPrettier = 'eslint-plugin-prettier';
export const eslintConfigFile = '.eslintrc.json';
export const prettierConfigFile = '.prettierrc';
export const prettierConfigJsonFile = '.prettierrc.json';

export default async function (tree: Tree) {
  setPrettierConfig(tree);

  const eslintConfig = getEslintConfig(tree);
  if (isPrettierEslintPluginPresent(eslintConfig)) {
    return;
  }
  addPrettierEslintPlugin(eslintConfig);
  configurePrettierEslintRules(eslintConfig);
  writeJson(tree, eslintConfigFile, eslintConfig);

  addDependenciesToPackageJson(
    tree,
    {},
    { [eslintPluginPrettier]: getNpmPackageVersion(eslintPluginPrettier) ?? ' latest' }
  );
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
  };
}

function getEslintConfig(tree: Tree): JSONSchemaForESLintConfigurationFiles {
  if (!tree.exists(eslintConfigFile)) {
    writeJson(tree, eslintConfigFile, { root: true, ignorePatterns: ['**/*'] });
  }

  return readJson<JSONSchemaForESLintConfigurationFiles>(tree, eslintConfigFile);
}

function isPrettierEslintPluginPresent(eslintConfig: JSONSchemaForESLintConfigurationFiles): boolean {
  return eslintConfig.plugins?.includes(prettierPlugin) ?? false;
}

function addPrettierEslintPlugin(eslintConfig: JSONSchemaForESLintConfigurationFiles): void {
  const plugins = eslintConfig.plugins ?? [];
  const prettierPluginIndex = plugins.indexOf('@nrwl/nx');
  plugins.splice(prettierPluginIndex + 1, 0, prettierPlugin);
  eslintConfig.plugins = plugins;
}

function configurePrettierEslintRules(eslintConfig: JSONSchemaForESLintConfigurationFiles): void {
  eslintConfig.overrides = [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json', '*.md'],
      extends: ['plugin:prettier/recommended'],
      rules: {},
    },
    ...(eslintConfig.overrides ?? []),
  ];
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
