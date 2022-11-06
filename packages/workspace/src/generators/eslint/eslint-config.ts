import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';

import { areSetsEqual, getSet, removeDuplicates } from '../lib';

export const eslintConfigFile = '.eslintrc.json';

type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type EsLintConfigurationOverrideRules = Exclude<JSONSchemaForESLintConfigurationFiles['overrides'], undefined>;
export type EsLintConfigurationOverrideRule = ArrayElement<EsLintConfigurationOverrideRules>;

export function readEsLintConfig(tree: Tree, path = eslintConfigFile): JSONSchemaForESLintConfigurationFiles {
  if (!tree.exists(eslintConfigFile)) {
    writeEsLintConfig(tree, { root: true, ignorePatterns: ['**/*'] }, eslintConfigFile);
  }

  return readJson<JSONSchemaForESLintConfigurationFiles>(tree, path);
}

export function writeEsLintConfig(
  tree: Tree,
  eslintConfig: JSONSchemaForESLintConfigurationFiles,
  path = eslintConfigFile
): void {
  writeJson(tree, path, eslintConfig);
}

export function isEsLintPluginPresent(tree: Tree, plugin: string): boolean {
  const eslintConfig = readEsLintConfig(tree);
  return eslintConfig.plugins?.includes(plugin) ?? false;
}

export function addEsLintPlugin(tree: Tree, plugin: string, after?: string): void {
  if (isEsLintPluginPresent(tree, plugin)) {
    return;
  }

  const eslintConfig = readEsLintConfig(tree);
  const plugins = [...(eslintConfig.plugins ?? [])];
  const afterPluginIndex = plugins.indexOf(after ?? '');

  if (after == null || afterPluginIndex === -1) {
    plugins.push(plugin);
  } else {
    plugins.splice(afterPluginIndex + 1, 0, plugin);
  }

  eslintConfig.plugins = plugins;
  writeEsLintConfig(tree, eslintConfig);
}

export function addEsLintRules(tree: Tree, rule: EsLintConfigurationOverrideRule, path = eslintConfigFile): void {
  const eslintConfig = readEsLintConfig(tree, path);

  const overrides = [...(eslintConfig.overrides ?? [])];

  // Check if there is a rule with the existing file definition, if so merge it
  const newRuleFilesSet = getSet(rule.files);
  const existingRule = overrides.filter((override) => areSetsEqual(getSet(override.files), newRuleFilesSet))[0];
  const existingRuleIndex = overrides.indexOf(existingRule);

  if (existingRule == null) {
    overrides.push(rule);
  } else {
    const newRule: EsLintConfigurationOverrideRule = { files: existingRule.files };

    if (rule.extends != null || existingRule.extends != null) {
      newRule.extends = removeDuplicates([...(existingRule.extends ?? []), ...(rule.extends ?? [])]);
    }

    const mergedKeys = ['rules', 'parserOptions', 'settings'] as const;
    mergedKeys.forEach((key) => {
      if (rule[key] != null || existingRule[key] != null) {
        newRule[key] = { ...(existingRule[key] ?? {}), ...(rule[key] ?? {}) };
      }
    });

    overrides[existingRuleIndex] = newRule;
  }

  eslintConfig.overrides = overrides;
  writeEsLintConfig(tree, eslintConfig, path);
}
