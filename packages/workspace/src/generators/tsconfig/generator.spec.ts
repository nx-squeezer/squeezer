import { Tree, readJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

import { tsConfigDefault, tsConfigFile } from '../core';
import generator from './generator';

describe('@nx-squeezer/workspace tsconfig generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await generator(tree);

    const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);

    expect(tsConfig).toBeDefined();
  });

  it('should set compiler options', async () => {
    await generator(tree);

    const tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);

    for (const compilerOption in tsConfigDefault.compilerOptions) {
      expect(tsConfig.compilerOptions?.[compilerOption]).toBe(tsConfigDefault.compilerOptions[compilerOption]);
    }
  });
});
