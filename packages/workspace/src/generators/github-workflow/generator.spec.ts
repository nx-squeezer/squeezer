import { NxJsonConfiguration, readJson, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parse } from 'yaml';

import {
  getGitRepo,
  nxConfigFile,
  readmeFile,
  readPackageJson,
  existsGitHubCiWorkflow,
  ciFile,
} from '@nx-squeezer/devkit';

import gitHubWorkflowGenerator from './generator';
import { gitHubWorkflowSchematic } from './generator.compat';

jest.mock('@nx-squeezer/devkit', () => ({
  ...jest.requireActual('@nx-squeezer/devkit'),
  getGitRepo: jest.fn(),
}));

describe('@nx-squeezer/workspace github workflow generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    (getGitRepo as jest.Mock).mockReturnValue('https://github.com/test/test');
  });

  it('should run successfully', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    expect(existsGitHubCiWorkflow(tree)).toBeTruthy();
  });

  it('should provide a schematic', async () => {
    expect(typeof gitHubWorkflowSchematic({ branch: 'main', useNxCloud: true, force: true })).toBe('function');
  });

  it('should skip execution if a GitHub CI workflow already exists', async () => {
    tree.write(ciFile, '');

    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: false });

    expect(console.log).toHaveBeenCalledWith(`GitHub workflow already existing at path: ${ciFile}`);
  });

  it('should not skip execution if a GitHub CI workflow already exists but passing force option', async () => {
    tree.write(ciFile, '');

    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    expect(tree.read(ciFile)?.toString()).toBeTruthy();
  });

  it('should generate the GitHub CI workflow', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const ci = parse(tree.read(ciFile)?.toString() ?? '');

    expect(ci).toMatchSnapshot();
  });

  it('should declare the nx script in package.json', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const packageJson = readPackageJson(tree);

    expect(packageJson.scripts?.nx).toBe('nx');
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.namedInputs).toStrictEqual({ ci: ['{workspaceRoot}/.github/workflows/*.yml'], default: ['ci'] });
  });

  it('should add a badge in readme', async () => {
    tree.write(readmeFile, '# Readme\n');
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain('[![CI]');
  });

  it('should not add a badge in readme if repo can not be resolved', async () => {
    (getGitRepo as jest.Mock).mockReturnValue(null);
    tree.write(readmeFile, '# Readme\n');
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).not.toContain('[![CI]');
    expect(console.error).toHaveBeenCalledWith(`Could not add badge to README, remote repo could not be detected.`);
  });
});
