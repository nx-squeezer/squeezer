import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { exec } from '../exec';
import { getGitRepo, getGitRepoSlug } from './get-git-repo';

jest.mock('../exec');

describe('@nx-squeezer/workspace getGitRepo', () => {
  let tree: Tree;
  const gitRepo = 'https://github.com/nx-squeezer/squeezer';

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute git command and return correct git repo', () => {
    (exec as jest.Mock).mockReturnValue({ output: `${gitRepo}.git\n` });

    expect(getGitRepo(tree)).toBe(gitRepo);
    expect(exec).toHaveBeenCalledWith('git', ['config', '--get', 'remote.origin.url'], {
      cwd: '/virtual',
    });
  });

  it('should not fail if exec sync fails', () => {
    (exec as jest.Mock).mockReturnValue({ error: '' });

    expect(getGitRepo(tree)).toBeNull();
    expect(console.error).toHaveBeenCalledWith(`Could not resolve git repo remote url.`);
  });

  it('should return git repo slug', () => {
    (exec as jest.Mock).mockReturnValue({ output: `${gitRepo}.git\n` });

    expect(getGitRepoSlug(tree)).toBe('nx-squeezer/squeezer');
  });
});
