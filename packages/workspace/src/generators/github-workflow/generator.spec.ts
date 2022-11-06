import { NxJsonConfiguration, readJson, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { parse } from 'yaml';

import { getGitRepo, readPackageJson, readmeFile } from '../lib';
import { nxConfigFile } from '../lib/nx';
import { gitHubWorkflowGenerator } from './generator';
import { gitHubWorkflowSchematic } from './generator.compat';
import { existsGitHubCiWorkflow, ciFile } from './github-workflow';

jest.mock('../lib', () => ({
  ...jest.requireActual('../lib'),
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

    expect(ci).toStrictEqual(ciFileContent());
  });

  it('should declare the nx script in package.json', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const packageJson = readPackageJson(tree);

    expect(packageJson.scripts?.nx).toBe('nx');
    expect(packageJson.scripts?.['lint:workspace']).toBe('nx workspace-lint');
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    expect(nxConfig.implicitDependencies?.['.github/workflows/*.yml']).toBe('*');
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

/* eslint-disable sonarjs/no-duplicate-string */
const ciFileContent = () => ({
  name: 'CI',
  on: {
    push: {
      branches: ['main'],
    },
    pull_request: {
      branches: ['main'],
    },
  },
  jobs: {
    npm: {
      name: 'NPM',
      'runs-on': 'ubuntu-latest',
      env: {
        NX_RUN_GROUP: '${{ github.run_id }}',
        NX_CLOUD_AUTH_TOKEN: '${{ secrets.NX_CLOUD_AUTH_TOKEN }}',
      },
      steps: [
        {
          name: 'Checkout repo',
          uses: 'actions/checkout@v3.0.2',
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v3.4.1',
          with: {
            'node-version': '16.x',
          },
        },
        {
          name: 'NPM',
          uses: 'ng-easy/npm-setup@v2.0.10',
        },
      ],
    },
    build: {
      name: 'Build',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
        NX_RUN_GROUP: '${{ github.run_id }}',
        NX_CLOUD_AUTH_TOKEN: '${{ secrets.NX_CLOUD_AUTH_TOKEN }}',
      },
      steps: [
        {
          name: 'Checkout repo',
          uses: 'actions/checkout@v3.0.2',
          with: {
            'fetch-depth': 0,
          },
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v3.4.1',
          with: {
            'node-version': '16.x',
          },
        },
        {
          name: 'NPM',
          uses: 'ng-easy/npm-setup@v2.0.10',
          with: {
            'nx-key': 'build',
          },
        },
        {
          name: 'Nx Set SHAs',
          uses: 'nrwl/nx-set-shas@v2.2.7',
        },
        {
          name: 'Build',
          uses: 'mansagroup/nrwl-nx-action@v2.1.0',
          with: {
            targets: 'build',
            affected: 'true',
            parallel: 'true',
            maxParallel: 3,
            nxCloud: 'true',
          },
        },
      ],
    },
    lint: {
      name: 'Lint',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
        NX_RUN_GROUP: '${{ github.run_id }}',
        NX_CLOUD_AUTH_TOKEN: '${{ secrets.NX_CLOUD_AUTH_TOKEN }}',
      },
      steps: [
        {
          name: 'Checkout repo',
          uses: 'actions/checkout@v3.0.2',
          with: {
            'fetch-depth': 0,
          },
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v3.4.1',
          with: {
            'node-version': '16.x',
          },
        },
        {
          name: 'NPM',
          uses: 'ng-easy/npm-setup@v2.0.10',
          with: {
            'nx-key': 'lint',
          },
        },
        {
          name: 'Nx Set SHAs',
          uses: 'nrwl/nx-set-shas@v2.2.7',
        },
        {
          name: 'Lint',
          uses: 'mansagroup/nrwl-nx-action@v2.1.0',
          with: {
            targets: 'lint',
            affected: 'true',
            parallel: 'true',
            maxParallel: 3,
            nxCloud: 'true',
          },
        },
        {
          name: 'lint workspace',
          run: 'npm run lint:workspace',
        },
      ],
    },
    test: {
      name: 'Test',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
        NX_RUN_GROUP: '${{ github.run_id }}',
        NX_CLOUD_AUTH_TOKEN: '${{ secrets.NX_CLOUD_AUTH_TOKEN }}',
      },
      steps: [
        {
          name: 'Checkout repo',
          uses: 'actions/checkout@v3.0.2',
          with: {
            'fetch-depth': 0,
          },
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v3.4.1',
          with: {
            'node-version': '16.x',
          },
        },
        {
          name: 'NPM',
          uses: 'ng-easy/npm-setup@v2.0.10',
          with: {
            'nx-key': 'test',
          },
        },
        {
          name: 'Nx Set SHAs',
          uses: 'nrwl/nx-set-shas@v2.2.7',
        },
        {
          name: 'Test',
          uses: 'mansagroup/nrwl-nx-action@v2.1.0',
          with: {
            targets: 'test',
            affected: 'true',
            parallel: 'true',
            maxParallel: 3,
            nxCloud: 'true',
          },
        },
      ],
    },
    e2e: {
      name: 'e2e',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
        NX_RUN_GROUP: '${{ github.run_id }}',
        NX_CLOUD_AUTH_TOKEN: '${{ secrets.NX_CLOUD_AUTH_TOKEN }}',
      },
      steps: [
        {
          name: 'Checkout repo',
          uses: 'actions/checkout@v3.0.2',
          with: {
            'fetch-depth': 0,
          },
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v3.4.1',
          with: {
            'node-version': '16.x',
          },
        },
        {
          name: 'NPM',
          uses: 'ng-easy/npm-setup@v2.0.10',
          with: {
            'nx-key': 'e2e',
          },
        },
        {
          name: 'Nx Set SHAs',
          uses: 'nrwl/nx-set-shas@v2.2.7',
        },
        {
          name: 'e2e',
          uses: 'mansagroup/nrwl-nx-action@v2.1.0',
          with: {
            targets: 'e2e',
            affected: 'true',
            parallel: 'true',
            maxParallel: 1,
            nxCloud: 'true',
          },
        },
      ],
    },
  },
});
