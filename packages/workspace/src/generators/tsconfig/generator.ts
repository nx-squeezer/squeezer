import { formatFiles, readJson, Tree, writeJson } from '@nrwl/devkit';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

import { lintWorkspaceTask, tsConfigDefault, tsConfigFile } from '../lib';

export async function tsConfigGenerator(tree: Tree) {
  if (!setTsConfig(tree)) {
    return;
  }

  await formatFiles(tree);

  return () => {
    lintWorkspaceTask(tree);
  };
}

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
