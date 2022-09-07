import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readJson, writeJson } from '@nrwl/devkit';

import generator, { eslintConfigFile, eslintPluginPrettier, prettierConfigJsonFile, prettierPlugin } from './generator';
import { JSONSchemaForESLintConfigurationFiles } from '@schemastore/eslintrc';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';
import { prettierDefaultConfig } from './prettier-default-config';

describe('@nx-squeezer/workspace prettier generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    writeJson(appTree, eslintConfigFile, {});
  });

  it('should run successfully', async () => {
    await generator(appTree);

    const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(appTree, eslintConfigFile);

    expect(eslintConfig).toBeDefined();
  });

  it('should add prettier to plugins', async () => {
    await generator(appTree);

    const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(appTree, eslintConfigFile);

    expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();
  });

  it('should add prettier to overrides', async () => {
    await generator(appTree);

    const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(appTree, eslintConfigFile);

    expect(eslintConfig.overrides?.[0].extends).toStrictEqual(['plugin:prettier/recommended']);
  });

  it('should add eslint prettier dev dependency', async () => {
    await generator(appTree);

    const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>(appTree, 'package.json');

    expect(packageJson.devDependencies?.[eslintPluginPrettier]).toBeDefined();
  });

  it('should set default prettier config', async () => {
    await generator(appTree);

    const prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(appTree, prettierConfigJsonFile);

    expect(prettierConfig.printWidth).toBe(prettierDefaultConfig.printWidth);
  });

  it('should be idempotent', async () => {
    await generator(appTree);
    await generator(appTree);

    const eslintConfig = readJson<JSONSchemaForESLintConfigurationFiles>(appTree, eslintConfigFile);

    expect(eslintConfig.plugins?.filter((plugin) => plugin === prettierPlugin).length).toBe(1);
  });
});
