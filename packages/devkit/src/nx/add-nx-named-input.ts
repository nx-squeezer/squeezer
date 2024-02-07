import { Tree, NxJsonConfiguration, writeJson, readJson } from '@nx/devkit';
import { InputDefinition } from 'nx/src/config/workspace-json-project-json';
import { unique } from 'radash';

import { nxConfigFile } from './nx';

/**
 * Generator that adds a named input to Nx configuration.
 */
export function addNxNamedInput(
  tree: Tree,
  newNamedInputs: { [inputName: string]: (string | InputDefinition)[] },
  addToDefault = false
) {
  if (!tree.exists(nxConfigFile)) {
    return;
  }

  const nxConfig: NxJsonConfiguration = readJson<NxJsonConfiguration>(tree, nxConfigFile);
  const namedInputs = nxConfig.namedInputs ?? {};
  nxConfig.namedInputs = { ...namedInputs, ...newNamedInputs };

  if (addToDefault) {
    const defaultNamedInputs = namedInputs.default ?? [];
    nxConfig.namedInputs.default = unique([...defaultNamedInputs, ...Object.keys(newNamedInputs)]);
  }

  writeJson(tree, nxConfigFile, nxConfig);
}
