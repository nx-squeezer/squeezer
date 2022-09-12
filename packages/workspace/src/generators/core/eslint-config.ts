import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { areSetsEqual, getSet } from './set';

export const eslintConfigFile = '.eslintrc.json';

type ArrayElement<ArrayType> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type EsLintConfigurationOverrideRules = Exclude<JSONSchemaForESLintConfigurationFiles['overrides'], undefined>;
export type EsLintConfigurationOverrideRule = ArrayElement<EsLintConfigurationOverrideRules>;

export function readEsLintConfig(tree: Tree): JSONSchemaForESLintConfigurationFiles {
  if (!tree.exists(eslintConfigFile)) {
    writeJson(tree, eslintConfigFile, { root: true, ignorePatterns: ['**/*'] });
  }

  return readJson<JSONSchemaForESLintConfigurationFiles>(tree, eslintConfigFile);
}

export function isEsLintPluginPresent(eslintConfig: JSONSchemaForESLintConfigurationFiles, plugin: string): boolean {
  return eslintConfig.plugins?.includes(plugin) ?? false;
}

export function addEsLintPlugin(
  eslintConfig: JSONSchemaForESLintConfigurationFiles,
  plugin: string,
  after?: string
): JSONSchemaForESLintConfigurationFiles {
  if (isEsLintPluginPresent(eslintConfig, plugin)) {
    return eslintConfig;
  }

  const newEslintConfig: JSONSchemaForESLintConfigurationFiles = { ...eslintConfig };
  const plugins = [...(newEslintConfig.plugins ?? [])];
  const afterPluginIndex = plugins.indexOf(after ?? '');

  if (after == null || afterPluginIndex === -1) {
    plugins.push(plugin);
  } else {
    plugins.splice(afterPluginIndex + 1, 0, plugin);
  }

  newEslintConfig.plugins = plugins;
  return newEslintConfig;
}

export function addEsLintRules(
  eslintConfig: JSONSchemaForESLintConfigurationFiles,
  rule: EsLintConfigurationOverrideRule
): JSONSchemaForESLintConfigurationFiles {
  const newEslintConfig: JSONSchemaForESLintConfigurationFiles = { ...eslintConfig };

  const overrides = [...(eslintConfig.overrides ?? [])];

  // Check if there is a rule with the existing file definition, if so merge it
  const newRuleFilesSet = getSet(rule.files);
  const existingRule = overrides.filter((override) => areSetsEqual(getSet(override.files), newRuleFilesSet))[0];

  if (existingRule == null) {
    overrides.push(rule);
  } else {
    existingRule.extends = [...(existingRule.extends ?? []), ...(rule.extends ?? [])];
    existingRule.rules = { ...(existingRule.rules ?? []), ...(rule.rules ?? []) };
  }

  newEslintConfig.overrides = overrides;
  return newEslintConfig;
}

export function writeEsLintConfig(tree: Tree, eslintConfig: JSONSchemaForESLintConfigurationFiles): void {
  writeJson(tree, eslintConfigFile, eslintConfig);
}
