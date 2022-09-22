import { NxJsonConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import fetch from 'node-fetch-commonjs';

import { getGitRepoSlug, nxConfigFile, readCodecov, readmeFile } from '../core';
import { codecovDotFile } from './../core/codecov';
import generator from './generator';

jest.mock('node-fetch-commonjs');
jest.mock('../core/get-git-repo');

describe('@nx-squeezer/workspace codecov generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
    (getGitRepoSlug as jest.Mock).mockReturnValue('test/test');
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await generator(tree);

    const codecov = readCodecov(tree);

    expect(codecov).toBeDefined();
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await generator(tree);

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.implicitDependencies?.[codecovDotFile]).toBe('*');
  });

  it('should add a badge in readme', async () => {
    tree.write(readmeFile, '# Readme\n');
    await generator(tree);

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain('[![codecov]');
  });
});
