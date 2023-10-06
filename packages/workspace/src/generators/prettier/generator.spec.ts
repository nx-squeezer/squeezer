import { Tree, readJson, installPackagesTask } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';

import { lintWorkspaceTask, formatWorkspaceTask } from '@nx-squeezer/devkit';

import prettierGenerator from './generator';
import { prettierSchematic } from './generator.compat';
import { prettierConfigFile, prettierPlugin, eslintPluginPrettier, prettierConfigJsonFile } from './prettier';
import { prettierDefaultConfig } from './prettier-default-config';
import { readEsLintConfig, writeEsLintConfig } from '../eslint';

jest.mock('@nx-squeezer/devkit', () => ({
  ...jest.requireActual('@nx-squeezer/devkit'),
  lintWorkspaceTask: jest.fn(),
  formatWorkspaceTask: jest.fn(),
}));

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.setTimeout(10_000);

describe('@nx-squeezer/workspace prettier generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await prettierGenerator(tree);

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof prettierSchematic({})).toBe('function');
  });

  it('should run successfully even if there was no previous prettier config', async () => {
    tree.delete(prettierConfigFile);

    await prettierGenerator(tree);

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig).toBeDefined();
  });

  it('should run tasks', async () => {
    const tasks = await prettierGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(lintWorkspaceTask).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
    expect(formatWorkspaceTask).toHaveBeenCalled();
  });

  it('should add prettier to plugins', async () => {
    await prettierGenerator(tree);

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig.plugins?.includes(prettierPlugin)).toBeTruthy();
  });

  it('should add prettier to overrides', async () => {
    await prettierGenerator(tree);

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig.overrides?.[0].extends).toStrictEqual(['plugin:prettier/recommended']);
  });

  it('should add eslint prettier dev dependency', async () => {
    await prettierGenerator(tree);

    const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>(tree, 'package.json');
    expect(packageJson.devDependencies?.[eslintPluginPrettier]).toBeDefined();
  });

  it('should set default prettier config', async () => {
    await prettierGenerator(tree);

    const prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(tree, prettierConfigJsonFile);
    expect(prettierConfig.printWidth).toBe(prettierDefaultConfig.printWidth);
  });

  it('should be idempotent', async () => {
    await prettierGenerator(tree);
    await prettierGenerator(tree);

    const eslintConfig = readEsLintConfig(tree);
    expect(eslintConfig.plugins?.filter((plugin) => plugin === prettierPlugin).length).toBe(1);
  });
});
