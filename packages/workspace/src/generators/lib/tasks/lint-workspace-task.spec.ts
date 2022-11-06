import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { lintWorkspaceTask } from './lint-workspace-task';

jest.mock('child_process');

describe('@nx-squeezer/workspace lintWorkspaceTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute lint command', () => {
    (execSync as jest.Mock).mockReturnValue(null);

    lintWorkspaceTask(tree);

    expect(execSync).toHaveBeenCalledWith('npx nx run-many --target=lint --parallel=2 --all --fix', {
      cwd: '/virtual',
      stdio: [0, 1, 2],
    });
  });

  it('should not fail if exec sync fails', () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    lintWorkspaceTask(tree);

    expect(console.error).toHaveBeenCalledWith(`Could not lint projects in path: /virtual`);
  });
});
