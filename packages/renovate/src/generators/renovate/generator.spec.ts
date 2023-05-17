import { Tree, readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { parse, stringify } from 'yaml';

import { readmeFile, getGitRepoSlug, securityFile, ciFile } from '@nx-squeezer/devkit';

import { renovateGenerator } from './generator';
import { renovateSchematic } from './generator.compat';
import { renovateCiFile, renovateFile, renovateConfigFile, renovatePresets, renovateBranch } from './renovate';
import { renovateConfigValidatorTask } from './renovate-config-validator-task';

jest.mock('@nx-squeezer/devkit', () => ({
  ...jest.requireActual('@nx-squeezer/devkit'),
  renovateConfigValidatorTask: jest.fn(),
  getGitRepoSlug: jest.fn(),
}));

jest.mock('./renovate-config-validator-task');

describe('@nx-squeezer/renovate renovate generator', () => {
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

    expect(ci).toMatchSnapshot();
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

    expect(tree.read(renovateConfigFile)?.toString()).toMatchSnapshot();
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
