import { Tree, installPackagesTask, readJson, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addDevDependencyToPackageJson, addHuskyHookTask, addHuskyToPackageJson, installHuskyTask } from '../lib';
import { lintStagedGenerator } from './generator';
import { lintStagedSchematic } from './generator.compat';
import { lintStaged, lintStagedConfigPath, lintStagedDefaultConfig, LintStagedConfig } from './lint-staged';

jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual('@nrwl/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.mock('../lib');

describe('@nx-squeezer/workspace lint-staged generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await lintStagedGenerator(tree);
  });

  it('should provide a schematic', async () => {
    expect(typeof lintStagedSchematic({})).toBe('function');
  });

  it('should add dependencies', async () => {
    await lintStagedGenerator(tree);

    expect(addHuskyToPackageJson).toHaveBeenCalled();
    expect(addDevDependencyToPackageJson).toHaveBeenCalledWith(tree, lintStaged);
  });

  it('should create lint-staged config', async () => {
    await lintStagedGenerator(tree);

    expect(readJson(tree, lintStagedConfigPath)).toStrictEqual(lintStagedDefaultConfig);
  });

  it('should merge lint-staged config', async () => {
    const mdFormat: LintStagedConfig = { '*.md': 'markdown --format' };
    writeJson(tree, lintStagedConfigPath, mdFormat);

    await lintStagedGenerator(tree);

    expect(readJson(tree, lintStagedConfigPath)).toStrictEqual({ ...mdFormat, ...lintStagedDefaultConfig });
  });

  it('should run tasks', async () => {
    const tasks = await lintStagedGenerator(tree);

    expect(tasks).toBeTruthy();

    tasks?.();

    expect(installPackagesTask).toHaveBeenCalled();
    expect(installHuskyTask).toHaveBeenCalled();
    expect(addHuskyHookTask).toHaveBeenCalledWith(tree, 'pre-commit', 'npx lint-staged');
  });
});
