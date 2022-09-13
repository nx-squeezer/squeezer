import { Tree, readJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';

import {
  eslintPluginPrettier,
  prettierConfigJsonFile,
  prettierPlugin,
  readEsLintConfig,
  writeEsLintConfig,
} from '../core';
import generator from './generator';
import { prettierDefaultConfig } from './prettier-default-config';

describe('@nx-squeezer/workspace prettier generator', () => {
  let tree: Tree;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await generator(tree);

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should add prettier to plugins', async () => {
    await generator(tree);

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();
  });

  it('should add prettier to overrides', async () => {
    await generator(tree);

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.overrides?.[0].extends).toStrictEqual(['plugin:prettier/recommended']);
  });

  it('should add eslint prettier dev dependency', async () => {
    await generator(tree);

    const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>(tree, 'package.json');

    expect(packageJson.devDependencies?.[eslintPluginPrettier]).toBeDefined();
  });

  it('should set default prettier config', async () => {
    await generator(tree);

    const prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(tree, prettierConfigJsonFile);

    expect(prettierConfig.printWidth).toBe(prettierDefaultConfig.printWidth);
  });

  it('should be idempotent', async () => {
    await generator(tree);
    await generator(tree);

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.filter((plugin) => plugin === prettierPlugin).length).toBe(1);
  });
});
