import { Tree, readJson } from '@nrwl/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

import { lintWorkspaceTask } from '@nx-squeezer/devkit';

import { tsConfigGenerator } from './generator';
import { tsConfigSchematic } from './generator.compat';
import { tsConfigFile, tsConfigDefault } from './tsconfig';

jest.mock('@nx-squeezer/devkit', () => ({
  ...jest.requireActual('@nx-squeezer/devkit'),
  lintWorkspaceTask: jest.fn(),
}));

describe('@nx-squeezer/workspace tsconfig generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await tsConfigGenerator(tree);

    const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);

    expect(tsConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof tsConfigSchematic({})).toBe('function');
  });

  it('should skip execution if tsconfig file does not exist', async () => {
    tree = createTree();

    await tsConfigGenerator(tree);

    expect(tree.exists(tsConfigFile)).toBeFalsy();
    expect(console.error).toHaveBeenCalledWith(`File ${tsConfigFile} not found.`);
  });

  it('should run tasks', async () => {
    const tasks = await tsConfigGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(lintWorkspaceTask).toHaveBeenCalled();
  });

  it('should set compiler options', async () => {
    await tsConfigGenerator(tree);

    const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);

    for (const compilerOption in tsConfigDefault.compilerOptions) {
      expect(tsConfig.compilerOptions?.[compilerOption]).toBe(tsConfigDefault.compilerOptions[compilerOption]);
    }
  });
});
