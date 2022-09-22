import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { formatWorkspaceTask } from './format-workspace-task';

jest.mock('child_process');

describe('@nx-squeezer/workspace formatWorkspaceTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute prettier command', () => {
    (execSync as jest.Mock).mockReturnValue(null);

    formatWorkspaceTask(tree);

    expect(execSync).toHaveBeenCalledWith('npx prettier . --write', { cwd: '/virtual', stdio: [0, 1, 2] });
  });

  it('should not fail if exec sync fails', () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    formatWorkspaceTask(tree);

    expect(console.error).toHaveBeenCalledWith(`Could not format files in path: /virtual`);
  });
});
