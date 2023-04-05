import { join } from 'path';

import { formatFiles, getProjects, installPackagesTask, ProjectConfiguration, Tree } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

import { lintWorkspaceTask, addDevDependencyToPackageJson, joinNormalize } from '@nx-squeezer/devkit';

import {
  addEsLintRules,
  readEsLintConfig,
  writeEsLintConfig,
  addEsLintPlugin,
  EsLintConfigurationOverrideRule,
  eslintConfigFile,
} from './eslint-config';
import { deprecationRule, esLintRule, importOrderRule, sonarJSRule, typescriptRule, unusedImportsRule } from './rules';
import { EsLintGeneratorSchema } from './schema';

export async function eslintGenerator(tree: Tree, options: EsLintGeneratorSchema) {
  if (options.eslintRecommended) {
    addEsLintRecommendedRules(tree);
  }

  if (options.sonarJs) {
    addSonarJsRecommendedRules(tree);
  }

  if (options.unusedImports) {
    addUnusedImportsRules(tree);
  }

  if (options.typescriptRecommended) {
    addTypescriptRecommendedRules(tree);
  }

  if (options.deprecation) {
    addDeprecationRules(tree);
  }

  if (options.importOrder) {
    addImportOrderRules(tree);
  }

  await formatFiles(tree);

  return () => {
    installPackagesTask(tree);
    lintWorkspaceTask(tree);
  };
}

function addEsLintRecommendedRules(tree: Tree): void {
  addEsLintRules(tree, esLintRule);

  const eslintConfig = readEsLintConfig(tree);

  const env: Exclude<JSONSchemaForESLintConfigurationFiles['env'], undefined> = { ...(eslintConfig.env, {}) };
  env.node = true;
  env.browser = true;
  env.es2022 = true;

  eslintConfig.env = env;

  writeEsLintConfig(tree, eslintConfig);
}

function addSonarJsRecommendedRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-sonarjs');
  addEsLintPlugin(tree, 'sonarjs');
  addEsLintRules(tree, sonarJSRule);
}

function addUnusedImportsRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-unused-imports');
  addEsLintPlugin(tree, 'unused-imports');
  addEsLintRules(tree, unusedImportsRule);
}

function addTypescriptRecommendedRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, '@typescript-eslint/parser');
  addDevDependencyToPackageJson(tree, '@typescript-eslint/eslint-plugin');
  addEsLintPlugin(tree, '@typescript-eslint');
  addEsLintRules(tree, typescriptRule);
  addParserOptionsToProjects(tree);
}

function addDeprecationRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, '@typescript-eslint/parser');
  addDevDependencyToPackageJson(tree, '@typescript-eslint/eslint-plugin');
  addDevDependencyToPackageJson(tree, '@delagen/eslint-plugin-deprecation');
  addEsLintPlugin(tree, '@delagen/deprecation');
  addEsLintRules(tree, deprecationRule);
  addParserOptionsToProjects(tree);
}

function addImportOrderRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-import');
  addDevDependencyToPackageJson(tree, 'eslint-import-resolver-typescript');
  addEsLintPlugin(tree, 'import');
  addEsLintRules(tree, importOrderRule);
}

function addParserOptionsToProjects(tree: Tree) {
  updateEsLintProjectConfig(tree, (project) => ({
    files: ['*.ts', '*.tsx'],
    parserOptions: {
      project: [joinNormalize(project.root, 'tsconfig*.json')],
    },
  }));
}

function updateEsLintProjectConfig(
  tree: Tree,
  projectRule: (project: ProjectConfiguration) => EsLintConfigurationOverrideRule
) {
  const projects = getProjects(tree);
  projects.forEach((project: ProjectConfiguration) => {
    const eslintConfigProjectFile = join(project.root, eslintConfigFile);
    if (!tree.exists(eslintConfigProjectFile)) {
      return;
    }

    addEsLintRules(tree, projectRule(project), eslintConfigProjectFile);
  });
}
