import { NxJsonConfiguration, readJson, Tree, writeJson } from '@nx/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { addNxNamedInput } from './add-nx-named-input';
import { nxConfigFile } from './nx';

describe('@nx-squeezer/devkit addNxNamedInput', () => {
  let tree: Tree;
  const exampleNamedInput = { example: ['example.json'] };

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should do nothing if there is no nx.json file', () => {
    tree = createTree();

    addNxNamedInput(tree, {});

    expect(tree.exists(nxConfigFile)).toBeFalsy();
  });

  it('should add the implicit dependency', () => {
    tree = createTreeWithEmptyWorkspace();
    const nx = readJson<NxJsonConfiguration>(tree, nxConfigFile);
    nx.namedInputs = undefined;
    writeJson(tree, nxConfigFile, nx);

    addNxNamedInput(tree, exampleNamedInput);

    expect(tree.exists(nxConfigFile)).toBeTruthy();
    expect(readJson<NxJsonConfiguration>(tree, nxConfigFile).namedInputs?.example).toStrictEqual(
      exampleNamedInput.example
    );
  });

  it('should overwrite the implicit dependency if it existed', () => {
    tree = createTreeWithEmptyWorkspace();
    const nx = readJson<NxJsonConfiguration>(tree, nxConfigFile);
    nx.namedInputs = { example: ['previous'] };
    writeJson(tree, nxConfigFile, nx);

    addNxNamedInput(tree, exampleNamedInput);

    expect(tree.exists(nxConfigFile)).toBeTruthy();
    expect(readJson<NxJsonConfiguration>(tree, nxConfigFile).namedInputs?.example).toStrictEqual(
      exampleNamedInput.example
    );
  });

  it('should add the implicit dependency as default if there where none', () => {
    tree = createTreeWithEmptyWorkspace();
    const nx = readJson<NxJsonConfiguration>(tree, nxConfigFile);
    nx.namedInputs = undefined;
    writeJson(tree, nxConfigFile, nx);

    addNxNamedInput(tree, exampleNamedInput, true);

    expect(tree.exists(nxConfigFile)).toBeTruthy();
    expect(readJson<NxJsonConfiguration>(tree, nxConfigFile).namedInputs).toStrictEqual({
      ...exampleNamedInput,
      default: ['example'],
    });
  });

  it('should add the implicit dependency as default if there where previous defaults', () => {
    tree = createTreeWithEmptyWorkspace();
    const nx = readJson<NxJsonConfiguration>(tree, nxConfigFile);
    nx.namedInputs = { default: ['default'] };
    writeJson(tree, nxConfigFile, nx);

    addNxNamedInput(tree, exampleNamedInput, true);

    expect(tree.exists(nxConfigFile)).toBeTruthy();
    expect(readJson<NxJsonConfiguration>(tree, nxConfigFile).namedInputs).toStrictEqual({
      ...exampleNamedInput,
      default: ['default', 'example'],
    });
  });
});
