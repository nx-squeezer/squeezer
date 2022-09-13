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
  if (options.eslintRecommended) {
    addEsLintRecommendedRules(tree);
  }

  if (options.sonarJs) {
    addDevDependencyToPackageJson(tree, 'eslint-plugin-sonarjs');
    addEsLintPlugin(tree, 'sonarjs');
    addSonarJsRecommendedRules(tree);
  }

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
  };
}

function addEsLintRecommendedRules(tree: Tree): void {
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    extends: ['eslint:recommended'],
    rules: {},
  });

  const eslintConfig = readEsLintConfig(tree);

  const env: Exclude<JSONSchemaForESLintConfigurationFiles['env'], undefined> = { ...(eslintConfig.env, {}) };
  env.node = true;
  env.browser = true;
  env.es2022 = true;

  writeEsLintConfig(tree, eslintConfig);
}

function addSonarJsRecommendedRules(tree: Tree): void {
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    extends: ['plugin:sonarjs/recommended'],
    rules: {},
  });
}
