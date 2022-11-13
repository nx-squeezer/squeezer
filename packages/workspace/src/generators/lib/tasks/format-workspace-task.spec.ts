import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { exec } from '../exec';
import { formatWorkspaceTask } from './format-workspace-task';

jest.mock('../exec');

describe('@nx-squeezer/workspace formatWorkspaceTask', () => {
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
