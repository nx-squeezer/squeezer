import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { NxJsonConfiguration, readJson, Tree } from '@nrwl/devkit';

import generator, { ciFile } from './generator';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';
import { nxConfigFile } from '../core/nx';
import { readmeFile } from '../core/add-badge-to-readme';
import { getGitRepo } from '../core/get-git-repo';

jest.mock('../core/get-git-repo');

describe('@nx-squeezer/workspace github workflow generator', () => {
  let tree: Tree;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    (getGitRepo as jest.Mock).mockReturnValue('https://github.com/test/test');
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const ciWorkflow = tree.read(ciFile)?.toString();

    expect(ciWorkflow).toBeDefined();
  });

  it('should declare the nx script in package.json', async () => {
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>(tree, 'package.json');

    expect(packageJson.scripts?.nx).toBe('nx');
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const packageJson = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(packageJson.implicitDependencies?.['.github/workflows/*.yml']).toBe('*');
  });

  it('should add a badge in readme', async () => {
    tree.write(readmeFile, '# Readme\n');
    await generator(tree, { branch: 'main', useNxCloud: true, force: true });

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain('[![CI]');
  });
});
