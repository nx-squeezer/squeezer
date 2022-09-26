import { join } from 'path';

import { formatFiles, getProjects, installPackagesTask, ProjectConfiguration, Tree } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

import {
  addDevDependencyToPackageJson,
  addEsLintPlugin,
  addEsLintRules,
  lintWorkspaceTask,
  readEsLintConfig,
  writeEsLintConfig,
  eslintConfigFile,
  EsLintConfigurationOverrideRule,
  joinNormalize,
} from '../core';
import { EsLintGeneratorSchema } from './schema';

export default async function (tree: Tree, options: EsLintGeneratorSchema) {
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

  eslintConfig.env = env;

  writeEsLintConfig(tree, eslintConfig);
}

function addSonarJsRecommendedRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-sonarjs');
  addEsLintPlugin(tree, 'sonarjs');
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    extends: ['plugin:sonarjs/recommended'],
    rules: {},
  });
}

function addUnusedImportsRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-unused-imports');
  addEsLintPlugin(tree, 'unused-imports');
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx'],
    rules: {
      'unused-imports/no-unused-imports': 'error',
    },
  });
}

function addTypescriptRecommendedRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, '@typescript-eslint/parser');
  addDevDependencyToPackageJson(tree, '@typescript-eslint/eslint-plugin');
  addEsLintPlugin(tree, '@typescript-eslint');
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx'],
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'no-public' }],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/explicit-module-boundary-types': ['off'],
      '@typescript-eslint/ban-types': ['off'],
    },
  });
  addParserOptionsToProjects(tree);
}

function addDeprecationRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, '@typescript-eslint/parser');
  addDevDependencyToPackageJson(tree, '@typescript-eslint/eslint-plugin');
  addDevDependencyToPackageJson(tree, '@delagen/eslint-plugin-deprecation');
  addEsLintPlugin(tree, '@delagen/deprecation');
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx'],
    rules: {
      '@delagen/deprecation/deprecation': 'error',
    },
  });
  addParserOptionsToProjects(tree);
}

function addImportOrderRules(tree: Tree): void {
  addDevDependencyToPackageJson(tree, 'eslint-plugin-import');
  addDevDependencyToPackageJson(tree, 'eslint-import-resolver-typescript');
  addEsLintPlugin(tree, 'import');
  addEsLintRules(tree, {
    files: ['*.ts', '*.tsx'],
    extends: ['plugin:import/recommended', 'plugin:import/typescript'],
    rules: {
      'import/order': [
        'error',
        {
          pathGroups: [{ pattern: '@nx-*/**', group: 'internal', position: 'before' }],
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          pathGroupsExcludedImportTypes: [],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': ['off'],
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
        typescript: {},
      },
    },
  });
}

function addParserOptionsToProjects(tree: Tree) {
  updateEsLintProjectConfig(tree, (project) => ({
    files: ['*.ts', '*.tsx'],
    parserOptions: {
      project: [joinNormalize(project.root, 'tsconfig.*?.json')],
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
