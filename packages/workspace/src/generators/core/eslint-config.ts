import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { areSetsEqual, getSet, removeDuplicates } from './set';

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

export function writeEsLintConfig(tree: Tree, eslintConfig: JSONSchemaForESLintConfigurationFiles): void {
  writeJson(tree, eslintConfigFile, eslintConfig);
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

export function addEsLintRules(tree: Tree, rule: EsLintConfigurationOverrideRule): void {
  const eslintConfig = readEsLintConfig(tree);

  const overrides = [...(eslintConfig.overrides ?? [])];

  // Check if there is a rule with the existing file definition, if so merge it
  const newRuleFilesSet = getSet(rule.files);
  const existingRule = overrides.filter((override) => areSetsEqual(getSet(override.files), newRuleFilesSet))[0];
  const existingRuleIndex = overrides.indexOf(existingRule);

  if (existingRule == null) {
    overrides.push(rule);
  } else {
    overrides[existingRuleIndex] = {
      files: existingRule.files,
      extends: removeDuplicates([...(existingRule.extends ?? []), ...(rule.extends ?? [])]),
      rules: { ...(existingRule.rules ?? []), ...(rule.rules ?? []) },
    };
  }

  eslintConfig.overrides = overrides;
  writeEsLintConfig(tree, eslintConfig);
}
