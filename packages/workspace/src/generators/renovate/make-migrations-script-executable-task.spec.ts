import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { makeMigrationsScriptExecutableTask } from './make-migrations-script-executable-task';
import { renovateCreateMigrationsFile } from './renovate';
import { gitMakeExecutable } from '../lib';

jest.mock('../lib');

describe('@nx-squeezer/workspace makeMigrationsScriptExecutableTask', () => {
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
