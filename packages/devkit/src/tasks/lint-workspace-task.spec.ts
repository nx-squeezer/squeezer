import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';

import { lintWorkspaceTask } from './lint-workspace-task';
import { exec } from '../exec';

jest.mock('../exec');

describe('@nx-squeezer/devkit lintWorkspaceTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute lint command', () => {
    (exec as jest.Mock).mockReturnValue({});

    lintWorkspaceTask(tree);

    expect(exec).toHaveBeenCalledWith('npx', ['nx', 'run-many', '--target=lint', '--parallel=2', '--all', '--fix'], {
      cwd: '/virtual',
    });
  });

  it('should not fail if exec sync fails', () => {
    (exec as jest.Mock).mockReturnValue({ error: '' });

    lintWorkspaceTask(tree);

    expect(console.error).toHaveBeenCalledWith(`Could not lint projects in path: /virtual`);
  });
});
