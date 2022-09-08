import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readJson, writeJson } from '@nrwl/devkit';

import generator, { tsConfigFile } from './generator';

import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';
import { tsConfigDefault } from './tsconfig-default-config';

describe('@nx-squeezer/workspace tsconfig generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
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
