import { Tree, readJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { parse } from 'yaml';

import { renovateCiFile, renovateConfigFile, renovateFile, renovatePresets } from '../core';
import { getGitRepoSlug } from '../core/get-git-repo';
import generator from './generator';

jest.mock('../core/get-git-repo');

describe('@nx-squeezer/workspace renovate generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    (getGitRepoSlug as jest.Mock).mockReturnValue('test/test');
  });

  it('should run successfully', async () => {
    await generator(tree, { force: true, useNxCloud: true, local: true });
    expect(tree.exists(renovateCiFile)).toBeTruthy();
  });

  it('should skip execution if a Renovate CI workflow already exists', async () => {
    tree.write(renovateCiFile, '');

    await generator(tree, { force: false, useNxCloud: true, local: true });

    expect(console.log).toHaveBeenCalledWith(`Renovate workflow already existing at path: ${renovateCiFile}`);
  });

  it('should not skip execution if a Renovate CI workflow already exists but passing force option', async () => {
    tree.write(renovateCiFile, '');

    await generator(tree, { force: true, useNxCloud: true, local: true });

    expect(tree.read(renovateCiFile)?.toString()).toBeTruthy();
  });

  it('should generate the Renovate CI workflow', async () => {
    await generator(tree, { force: false, useNxCloud: true, local: true });

    const ci = parse(tree.read(renovateCiFile)?.toString() ?? '');

    expect(ci).toStrictEqual(renovateFileContent());
  });

  it('should fail if repo can not be resolved', async () => {
    (getGitRepoSlug as jest.Mock).mockReturnValue(null);

    expect(async () => await generator(tree, { force: false, useNxCloud: true, local: true })).rejects.toEqual(
      new Error(`Could not identify GitHub repo slug.`)
    );
  });

  it('should generate renovate.json with local configuration', async () => {
    await generator(tree, { force: false, useNxCloud: true, local: true, assignee: 'user' });

    expect(readJson(tree, renovateFile)).toStrictEqual({
      $schema: 'https://docs.renovatebot.com/renovate-schema.json',
      extends: ['config:base', ':label(dependencies)', 'local>test/test', ':assignee(user)'],
    });
  });

  it('should generate renovate.json with remote configuration', async () => {
    await generator(tree, { force: false, useNxCloud: true, local: false, assignee: 'user' });

    expect(readJson(tree, renovateFile)).toStrictEqual({
      $schema: 'https://docs.renovatebot.com/renovate-schema.json',
      extends: ['config:base', ':label(dependencies)', 'github>nx-squeezer/squeezer', ':assignee(user)'],
    });
  });

  it('should generate renovate-config.js', async () => {
    await generator(tree, { force: false, useNxCloud: true, local: true, assignee: 'user' });

    expect(tree.read(renovateConfigFile)?.toString()).toEqual(renovateConfigJsContent());
  });

  it('should generate presets when using local configuration', async () => {
    await generator(tree, { force: false, useNxCloud: true, local: true });

    renovatePresets.forEach((preset) => {
      expect(tree.exists(preset)).toBeTruthy();
    });
  });

  it('should not generate presets when using remote configuration', async () => {
    await generator(tree, { force: false, useNxCloud: true, local: false });

    renovatePresets.forEach((preset) => {
      expect(tree.exists(preset)).toBeFalsy();
    });
  });
});

const renovateFileContent = () => ({
  name: 'Renovate',
  on: {
    workflow_dispatch: null,
    schedule: [{ cron: '0/15 * * * *' }],
  },
  jobs: {
    renovate: {
      name: 'Renovate',
      'runs-on': 'ubuntu-latest',

      steps: [
        {
          name: 'Checkout repo',
          uses: 'actions/checkout@v3.0.2',
        },
        {
          name: 'Self-hosted Renovate',
          uses: 'renovatebot/github-action@v32.213.0',
          env: {
            LOG_LEVEL: 'debug',
            NX_CLOUD_AUTH_TOKEN: '${{ secrets.NX_CLOUD_AUTH_TOKEN }}',
          },
          with: {
            configurationFile: renovateConfigFile,
            token: '${{ secrets.RENOVATE_TOKEN }}',
          },
        },
      ],
    },
  },
});

const renovateConfigJsContent = () =>
  `module.exports = {
  repositories: ['test/test'],
  branchPrefix: 'renovate-github/',
  dryRun: null,
  gitAuthor: 'Renovate Bot GitHub <bot@renovateapp.com>',
  platform: 'github',
  includeForks: false,
  dependencyDashboard: true,
  onboarding: true,
  autodiscover: false,
  allowCustomCrateRegistries: true,
  allowScripts: true,
  exposeAllEnv: true,
  allowPostUpgradeCommandTemplating: true,
  allowedPostUpgradeCommands: [
    '^npm ci --ignore-scripts$',
    '^npm run prepare --if-present$',
    '^npm run format --if-present$',
    '^npx --no-install ng update (@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]* --from=\\d+\\.\\d+\\.\\d+ --to=\\d+\\.\\d+\\.\\d+ --migrate-only --allow-dirty --force$',
    '^npx --no-install ng lint --fix$',
    '^npx --no-install nx migrate (@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]* --from=(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*@\\d+\\.\\d+\\.\\d+ --to=(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*@\\d+\\.\\d+\\.\\d+$',
    '^rm -f migrations.json || true$',
    '^npx --no-install nx workspace-lint$',
    '^npx --no-install nx run-many --target=lint --all --parallel --fix --skip-nx-cache$',
  ],
};
`.replace(/\\/g, '\\\\');
