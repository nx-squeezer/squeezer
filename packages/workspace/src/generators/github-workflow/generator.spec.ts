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

import { gitHubWorkflowGenerator } from './generator';
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

    expect(ci).toStrictEqual(ciFileContent());
  });

  it('should declare the nx script in package.json', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const packageJson = readPackageJson(tree);

    expect(packageJson.scripts?.nx).toBe('nx');
  });

  it('should declare the implicit dependency in nx.json', async () => {
    await gitHubWorkflowGenerator(tree, { branch: 'main', useNxCloud: true, force: true });

    const nxConfig = readJson<NxJsonConfiguration>(tree, nxConfigFile);

    // eslint-disable-next-line @delagen/deprecation/deprecation -- https://github.com/nx-squeezer/squeezer/issues/680
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
            'node-version': '18.x',
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
            'node-version': '18.x',
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
          uses: 'nrwl/nx-set-shas@v3.0.0',
        },
        {
          name: 'Build',
          run: 'npx nx affected --target=build --parallel=3',
        },
      ],
    },
    lint: {
      name: 'Lint',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
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
            'node-version': '18.x',
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
          uses: 'nrwl/nx-set-shas@v3.0.0',
        },
        {
          name: 'Lint',
          run: 'npx nx affected --target=lint --parallel=3',
        },
        {
          name: 'Lint workspace',
          run: 'npm run lint:workspace',
        },
      ],
    },
    test: {
      name: 'Test',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
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
            'node-version': '18.x',
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
          uses: 'nrwl/nx-set-shas@v3.0.0',
        },
        {
          name: 'Test',
          run: 'npx nx affected --target=test --parallel=3',
        },
      ],
    },
    e2e: {
      name: 'e2e',
      needs: ['npm'],
      'runs-on': 'ubuntu-latest',
      env: {
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
            'node-version': '18.x',
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
          uses: 'nrwl/nx-set-shas@v3.0.0',
        },
        {
          name: 'e2e',
          run: 'npx nx affected --target=e2e --parallel=1',
        },
      ],
    },
  },
});
