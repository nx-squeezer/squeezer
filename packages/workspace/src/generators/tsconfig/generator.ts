import { formatFiles, readJson, Tree, writeJson } from '@nrwl/devkit';
import { lintWorkspaceTask, tsConfigDefault, tsConfigFile } from '../core';

import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

export default async function (tree: Tree) {
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
    console.log(`File ${tsConfigFile} not found`);
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
