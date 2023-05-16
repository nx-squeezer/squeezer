import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';

import { formatWorkspaceTask } from './format-workspace-task';
import { exec } from '../exec';

jest.mock('../exec');

describe('@nx-squeezer/devkit formatWorkspaceTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute prettier command', () => {
    (exec as jest.Mock).mockReturnValue({});

    formatWorkspaceTask(tree);

    expect(exec).toHaveBeenCalledWith('npx', ['prettier', '.', '--write'], { cwd: '/virtual' });
  });

  it('should not fail if exec sync fails', () => {
    (exec as jest.Mock).mockReturnValue({ error: '' });

    formatWorkspaceTask(tree);

    expect(console.error).toHaveBeenCalledWith(`Could not format files in path: /virtual`);
  });
});
