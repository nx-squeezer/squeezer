import { formatFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { addEsLintRules, lintWorkspaceTask, readEsLintConfig, writeEsLintConfig } from '../core';
import { EsLintGeneratorSchema } from './schema';

export default async function (tree: Tree, options: EsLintGeneratorSchema) {
  let eslintConfig: JSONSchemaForESLintConfigurationFiles = readEsLintConfig(tree);

  if (options.eslintRecommended) {
    eslintConfig = addEsLintRecommendedRules(eslintConfig);
  }

  writeEsLintConfig(tree, eslintConfig);

  /* addDependenciesToPackageJson(
    tree,
    {},
    { [eslintPluginPrettier]: getNpmPackageVersion(eslintPluginPrettier) ?? ' latest' }
  );*/
  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
  };
}

function addEsLintRecommendedRules(
  eslintConfig: JSONSchemaForESLintConfigurationFiles
): JSONSchemaForESLintConfigurationFiles {
  let newEslintConfig: JSONSchemaForESLintConfigurationFiles = { ...eslintConfig };
  newEslintConfig = addEsLintRules(newEslintConfig, {
    files: ['*.js', '*.jsx'],
    extends: ['eslint:recommended'],
    rules: {},
  });
  return newEslintConfig;
}
