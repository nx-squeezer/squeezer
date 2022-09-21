import { NxJsonConfiguration, readJson, Tree, writeJson } from '@nrwl/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addImplicitDependencyToNxConfig } from './add-implicit-dependency-to-nx-config';
import { nxConfigFile } from './nx';

describe('@nx-squeezer/workspace addImplicitDependencyToNxConfig', () => {
  let tree: Tree;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should do nothing if there is no nx.json file', () => {
    tree = createTree();

    addImplicitDependencyToNxConfig(tree, { file: '*' });

    expect(tree.exists(nxConfigFile)).toBeFalsy();
  });

  it('should add the implicit dependency', () => {
    tree = createTreeWithEmptyWorkspace();
    const nx = readJson<NxJsonConfiguration>(tree, nxConfigFile);
    nx.implicitDependencies = undefined;
    writeJson(tree, nxConfigFile, nx);

    addImplicitDependencyToNxConfig(tree, { file: '*' });

    expect(tree.exists(nxConfigFile)).toBeTruthy();
    expect(readJson<NxJsonConfiguration>(tree, nxConfigFile).implicitDependencies?.file).toBe('*');
  });

  it('should overwrite the implicit dependency if it existed', () => {
    tree = createTreeWithEmptyWorkspace();
    const nx = readJson<NxJsonConfiguration>(tree, nxConfigFile);
    nx.implicitDependencies = { file: ['project'] };
    writeJson(tree, nxConfigFile, nx);

    addImplicitDependencyToNxConfig(tree, { file: '*' });

    expect(tree.exists(nxConfigFile)).toBeTruthy();
    expect(readJson<NxJsonConfiguration>(tree, nxConfigFile).implicitDependencies?.file).toBe('*');
  });
});
