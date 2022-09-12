import { Tree, ImplicitDependencyEntry, NxJsonConfiguration, writeJson, readJson } from '@nrwl/devkit';
import { nxConfigFile } from './nx';

export function addImplicitDependencyToNxConfig(tree: Tree, implicitDependencyEntry: ImplicitDependencyEntry) {
  const nxConfig: NxJsonConfiguration | null = readJson<NxJsonConfiguration>(tree, nxConfigFile);
  if (nxConfig == null) {
    return;
  }

  const implicitDependencies: ImplicitDependencyEntry = nxConfig.implicitDependencies ?? {};
  nxConfig.implicitDependencies = { ...implicitDependencies, ...implicitDependencyEntry };

  writeJson(tree, nxConfigFile, nxConfig);
}
