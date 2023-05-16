/* eslint-disable @delagen/deprecation/deprecation -- https://github.com/nx-squeezer/squeezer/issues/680 */
import { Tree, ImplicitDependencyEntry, NxJsonConfiguration, writeJson, readJson } from '@nx/devkit';

import { nxConfigFile } from './nx';

export function addImplicitDependencyToNxConfig(tree: Tree, implicitDependencyEntry: ImplicitDependencyEntry) {
  if (!tree.exists(nxConfigFile)) {
    return;
  }

  const nxConfig: NxJsonConfiguration = readJson<NxJsonConfiguration>(tree, nxConfigFile);
  const implicitDependencies: ImplicitDependencyEntry = nxConfig.implicitDependencies ?? {};
  nxConfig.implicitDependencies = { ...implicitDependencies, ...implicitDependencyEntry };

  writeJson(tree, nxConfigFile, nxConfig);
}
