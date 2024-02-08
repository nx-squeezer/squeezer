import { formatFiles, readJson, Tree, writeJson } from '@nx/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

import { lintWorkspaceTask } from '@nx-squeezer/devkit';

import { tsConfigFile, tsConfigDefault } from './tsconfig';

/**
 * Nx generator to setup tsconfig and fix issues in the workspace.
 */
export default async function tsConfigGenerator(tree: Tree) {
  if (!setTsConfig(tree)) {
    return;
  }

  await formatFiles(tree);

  return () => {
    lintWorkspaceTask(tree);
  };
}

/**
 * @internal
 */
function setTsConfig(tree: Tree): boolean {
  if (!tree.exists(tsConfigFile)) {
    console.error(`File ${tsConfigFile} not found.`);
    return false;
  }

  let tsConfig = readJson<JSONSchemaForTheTypeScriptCompilerSConfigurationFile>(tree, tsConfigFile);
  tsConfig = {
    ...tsConfig,
    compilerOptions: {
      ...tsConfig.compilerOptions,
      ...tsConfigDefault.compilerOptions,
    },
  };

  writeJson(tree, tsConfigFile, tsConfig);

  return true;
}
