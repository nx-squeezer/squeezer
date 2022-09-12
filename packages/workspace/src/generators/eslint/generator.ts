import { formatFiles, installPackagesTask, Tree } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import {
  addDevDependencyToPackageJson,
  addEsLintPlugin,
  addEsLintRules,
  lintWorkspaceTask,
  readEsLintConfig,
  writeEsLintConfig,
} from '../core';
import { EsLintGeneratorSchema } from './schema';

export default async function (tree: Tree, options: EsLintGeneratorSchema) {
  let eslintConfig: JSONSchemaForESLintConfigurationFiles = readEsLintConfig(tree);

  if (options.eslintRecommended) {
    eslintConfig = addEsLintRecommendedRules(eslintConfig);
  }

  if (options.sonarJs) {
    addDevDependencyToPackageJson(tree, 'eslint-plugin-sonarjs');
    eslintConfig = addEsLintPlugin(eslintConfig, 'sonarjs');
    eslintConfig = addSonarJsRecommendedRules(eslintConfig);
  }

  writeEsLintConfig(tree, eslintConfig);
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

  const env: Exclude<JSONSchemaForESLintConfigurationFiles['env'], undefined> = { ...(eslintConfig.env, {}) };
  env.node = true;
  env.browser = true;
  env.es2022 = true;

  newEslintConfig = { env, ...newEslintConfig };

  newEslintConfig = addEsLintRules(newEslintConfig, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    extends: ['eslint:recommended'],
    rules: {},
  });

  return newEslintConfig;
}

function addSonarJsRecommendedRules(
  eslintConfig: JSONSchemaForESLintConfigurationFiles
): JSONSchemaForESLintConfigurationFiles {
  let newEslintConfig: JSONSchemaForESLintConfigurationFiles = { ...eslintConfig };

  newEslintConfig = addEsLintRules(newEslintConfig, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    extends: ['plugin:sonarjs/recommended'],
    rules: {},
  });

  return newEslintConfig;
}
