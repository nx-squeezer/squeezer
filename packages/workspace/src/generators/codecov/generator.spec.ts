import { NxJsonConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import fetch from 'node-fetch-commonjs';

import { nxConfigFile, readCodecov } from '../core';
import { codecovHiddenFile } from './../core/codecov';
import generator from './generator';

jest.mock('node-fetch-commonjs');

describe('@nx-squeezer/workspace codecov generator', () => {
  let tree: Tree;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('should run successfully', async () => {
    await generator(tree);

    const codecov = readCodecov(tree);

    expect(codecov).toBeDefined();
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await generator(tree);

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.implicitDependencies?.[codecovHiddenFile]).toBe('*');
  });
});
