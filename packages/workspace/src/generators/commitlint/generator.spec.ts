import { installPackagesTask, readJson, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import {
  commitlintCli,
  CommitlintConfig,
  commitlintConfigConventional,
  commitlintConfigPath,
  commitlintDefaultConfig,
} from './commitlint';
import { commitlintGenerator } from './generator';
import { commitlintSchematic } from './generator.compat';
import { addHuskyToPackageJson, addDevDependencyToPackageJson, installHuskyTask, addHuskyHookTask } from '../lib';

jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual('@nrwl/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.mock('../lib');

describe('@nx-squeezer/workspace commitlint generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await commitlintGenerator(tree);
  });

  it('should provide a schematic', async () => {
    expect(typeof commitlintSchematic({})).toBe('function');
  });

  it('should add dependencies', async () => {
    await commitlintGenerator(tree);

    expect(addHuskyToPackageJson).toHaveBeenCalled();
    expect(addDevDependencyToPackageJson).toHaveBeenCalledWith(tree, commitlintCli);
    expect(addDevDependencyToPackageJson).toHaveBeenCalledWith(tree, commitlintConfigConventional);
  });

  it('should create commitlint config', async () => {
    await commitlintGenerator(tree);

    expect(readJson(tree, commitlintConfigPath)).toStrictEqual(commitlintDefaultConfig);
  });

  it('should merge commitlint config', async () => {
    const commitlintEmpty: CommitlintConfig = { extends: [], rules: {} };
    writeJson(tree, commitlintConfigPath, commitlintEmpty);

    await commitlintGenerator(tree);

    expect(readJson(tree, commitlintConfigPath)).toStrictEqual({ ...commitlintEmpty, ...commitlintDefaultConfig });
  });

  it('should run tasks', async () => {
    const tasks = await commitlintGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(installPackagesTask).toHaveBeenCalled();
    expect(installHuskyTask).toHaveBeenCalled();
    expect(addHuskyHookTask).toHaveBeenCalledWith(tree, 'commit-msg', 'npx --no-install commitlint --edit $1');
  });
});
