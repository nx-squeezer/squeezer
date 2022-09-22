import { NxJsonConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { ciFile, readPackageJson } from '../core';
import { readmeFile } from '../core/add-badge-to-readme';
import { getGitRepo } from '../core/get-git-repo';
import { nxConfigFile } from '../core/nx';
import generator from './generator';

jest.mock('../core/get-git-repo');

describe('@nx-squeezer/workspace github workflow generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    (getGitRepo as jest.Mock).mockReturnValue('https://github.com/test/test');
  });

  it('should run successfully', async () => {
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const ciWorkflow = tree.read(ciFile)?.toString();

    expect(ciWorkflow).toBeDefined();
  });

  it('should declare the nx script in package.json', async () => {
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const packageJson = readPackageJson(tree);

    expect(packageJson.scripts?.nx).toBe('nx');
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.implicitDependencies?.['.github/workflows/*.yml']).toBe('*');
  });

  it('should add a badge in readme', async () => {
    tree.write(readmeFile, '# Readme\n');
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain('[![CI]');
  });
});
