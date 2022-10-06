import { Tree, readJson } from '@nrwl/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

import { lintWorkspaceTask, tsConfigDefault, tsConfigFile } from '../core';
import generator from './generator';
import schematic from './generator.compat';

jest.mock('../core', () => ({
  ...jest.requireActual('../core'),
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
    await generator(tree);

    const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);

    expect(tsConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof schematic({})).toBe('function');
  });

  it('should skip execution if tsconfig file does not exist', async () => {
    tree = createTree();

    await generator(tree);

    expect(tree.exists(tsConfigFile)).toBeFalsy();
    expect(console.error).toHaveBeenCalledWith(`File ${tsConfigFile} not found.`);
  });

  it('should run tasks', async () => {
    const tasks = await generator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(lintWorkspaceTask).toHaveBeenCalled();
  });

  it('should set compiler options', async () => {
    await generator(tree);

    const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);

    for (const compilerOption in tsConfigDefault.compilerOptions) {
      expect(tsConfig.compilerOptions?.[compilerOption]).toBe(tsConfigDefault.compilerOptions[compilerOption]);
    }
  });
});
