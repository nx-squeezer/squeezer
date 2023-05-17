import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parse, stringify } from 'yaml';

import { readmeFile, getGitRepoSlug, securityFile, ciFile } from '@nx-squeezer/devkit';

import { renovateGenerator } from './generator';
import { renovateSchematic } from './generator.compat';
import { makeMigrationsScriptExecutableTask } from './make-migrations-script-executable-task';
import { renovateCiFile, renovateFile, renovateConfigFile, renovatePresets, renovateBranch } from './renovate';
import { renovateConfigValidatorTask } from './renovate-config-validator-task';

jest.mock('@nx-squeezer/devkit', () => ({
  ...jest.requireActual('@nx-squeezer/devkit'),
  renovateConfigValidatorTask: jest.fn(),
  getGitRepoSlug: jest.fn(),
}));

jest.mock('./renovate-config-validator-task');
jest.mock('./make-migrations-script-executable-task');

describe('@nx-squeezer/workspace renovate generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(ciFile, stringify({ on: { push: { branches: ['main'] } } }));
    tree.write(readmeFile, `# README\n`);
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    (getGitRepoSlug as jest.Mock).mockReturnValue('test/test');
  });

  it('should run successfully', async () => {
    await renovateGenerator(tree, { force: true, useNxCloud: true, local: true });
    expect(tree.exists(renovateCiFile)).toBeTruthy();
  });

  it('should provide a schematic', async () => {
    expect(typeof renovateSchematic({ force: true, useNxCloud: true, local: true })).toBe('function');
  });

  it('should run tasks', async () => {
    const tasks = await renovateGenerator(tree, { force: true, useNxCloud: true, local: true });

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(renovateConfigValidatorTask).toHaveBeenCalled();
    expect(makeMigrationsScriptExecutableTask).toHaveBeenCalled();
  });

  it('should skip execution if a Renovate CI workflow already exists', async () => {
    tree.write(renovateCiFile, '');

    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true });

    expect(console.log).toHaveBeenCalledWith(`Renovate workflow already existing at path: ${renovateCiFile}`);
  });

  it('should not skip execution if a Renovate CI workflow already exists but passing force option', async () => {
    tree.write(renovateCiFile, '');

    await renovateGenerator(tree, { force: true, useNxCloud: true, local: true });

    expect(tree.read(renovateCiFile)?.toString()).toBeTruthy();
  });

  it('should generate the Renovate CI workflow', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true });

    const ci = parse(tree.read(renovateCiFile)?.toString() ?? '');

    expect(ci).toStrictEqual(renovateFileContent());
  });

  it('should fail if repo can not be resolved', async () => {
    (getGitRepoSlug as jest.Mock).mockReturnValue(null);

    await expect(
      async () => await renovateGenerator(tree, { force: false, useNxCloud: true, local: true })
    ).rejects.toEqual(new Error(`Could not identify GitHub repo slug.`));
  });

  it('should generate renovate.json with local configuration', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true, assignee: 'user' });

    expect(readJson(tree, renovateFile)).toStrictEqual({
      $schema: 'https://docs.renovatebot.com/renovate-schema.json',
      extends: [
        'config:base',
        ':label(dependencies)',
        'local>test/test',
        'local>test/test:nxMonorepo',
        ':assignee(user)',
      ],
    });
  });

  it('should generate renovate.json with remote configuration', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: false, assignee: 'user' });

    expect(readJson(tree, renovateFile)).toStrictEqual({
      $schema: 'https://docs.renovatebot.com/renovate-schema.json',
      extends: [
        'config:base',
        ':label(dependencies)',
        'github>nx-squeezer/squeezer',
        'github>nx-squeezer/squeezer:nxMonorepo',
        ':assignee(user)',
      ],
    });
  });

  it('should generate renovate-config.js', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true, assignee: 'user' });

    expect(tree.read(renovateConfigFile)?.toString()).toEqual(renovateConfigJsContent());
  });

  it('should generate presets when using local configuration', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true });

    renovatePresets.forEach((preset) => {
      expect(tree.exists(preset)).toBeTruthy();
    });
  });

  it('should not generate presets when using remote configuration', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: false });

    renovatePresets.forEach((preset) => {
      expect(tree.exists(preset)).toBeFalsy();
    });
  });

  it('should fail if can not find GitHub CI file', async () => {
    tree.delete(ciFile);

    await expect(
      async () => await renovateGenerator(tree, { force: false, useNxCloud: true, local: true })
    ).rejects.toEqual(new Error(`Renovate needs a GitHub workflow CI file, none found at: ${ciFile}`));
  });

  it('should add renovate branch to push branches', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: false });

    expect(parse(tree.read(ciFile)?.toString() ?? '').on.push.branches).toContain(renovateBranch);
  });

  it('should add renovate branch to push branches being idempotent', async () => {
    await renovateGenerator(tree, { force: true, useNxCloud: true, local: false });
    await renovateGenerator(tree, { force: true, useNxCloud: true, local: false });

    const ci = parse(tree.read(ciFile)?.toString() ?? '');
    expect(ci.on.push.branches.filter((branch: string) => branch === renovateBranch).length).toEqual(1);
  });

  it('should generate the security file if it did not exist before', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true });

    expect(tree.exists(securityFile)).toBeTruthy();
  });

  it('should skip generating the security file if it existed before', async () => {
    const customSecurity = 'custom';
    tree.write(securityFile, customSecurity);

    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true });

    expect(tree.read(securityFile)?.toString()).toContain(customSecurity);
  });

  it('should add renovate badge', async () => {
    await renovateGenerator(tree, { force: false, useNxCloud: true, local: true });

    expect(tree.read(readmeFile)?.toString()).toContain(
      `![renovate](https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot)`
    );
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
          uses: 'actions/checkout@v3.1.0',
        },
        {
          name: 'Self-hosted Renovate',
          uses: 'renovatebot/github-action@v32.217.0',
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
    '^npm install --ignore-scripts$',
    '^npm run prepare --if-present$',
    '^npm run format --if-present$',
    '^npx --no-install ng update (@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]* --from=\\d+\\.\\d+\\.\\d+ --to=\\d+\\.\\d+\\.\\d+ --migrate-only --allow-dirty --force$',
    '^npx --no-install ng lint --fix$',
    '^npx --no-install nx migrate (@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]* --from=(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*@\\d+\\.\\d+\\.\\d+ --to=(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*@\\d+\\.\\d+\\.\\d+$',
    '^bash nx-create-migrations\\.sh$',
    '^npx --no-install nx migrate --run-migrations$',
    '^rm -f migrations.json || true$',
    '^npx --no-install nx workspace-lint$',
    '^npx --no-install nx run-many --target=lint --all --parallel --fix --skip-nx-cache$',
  ],
};
`.replace(/\\/g, '\\\\');
