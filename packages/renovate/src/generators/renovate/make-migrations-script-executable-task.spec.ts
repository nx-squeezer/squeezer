import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';

import { gitMakeExecutable } from '@nx-squeezer/devkit';

import { makeMigrationsScriptExecutableTask } from './make-migrations-script-executable-task';
import { renovateCreateMigrationsFile } from './renovate';

jest.mock('@nx-squeezer/devkit');

describe('@nx-squeezer/renovate makeMigrationsScriptExecutableTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute git command', () => {
    (gitMakeExecutable as jest.Mock).mockReturnValue(null);

    expect(makeMigrationsScriptExecutableTask(tree)).toBeTruthy();
    expect(gitMakeExecutable).toHaveBeenCalledWith(tree, renovateCreateMigrationsFile);
  });

  it('should return false if command fails', () => {
    (gitMakeExecutable as jest.Mock).mockImplementation(() => {
      throw new Error(`Custom error`);
    });

    expect(makeMigrationsScriptExecutableTask(tree)).toBeFalsy();
  });
});
