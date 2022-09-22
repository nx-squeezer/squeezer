import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { getGitRepo, getGitRepoSlug } from './get-git-repo';

jest.mock('child_process');

describe('@nx-squeezer/workspace getGitRepo', () => {
  let tree: Tree;
  const gitRepo = 'https://github.com/nx-squeezer/squeezer';

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute git command and return correct git repo', () => {
    (execSync as jest.Mock).mockReturnValue(`${gitRepo}.git\n`);

    expect(getGitRepo(tree)).toBe(gitRepo);
    expect(execSync).toHaveBeenCalledWith('git config --get remote.origin.url', {
      cwd: '/virtual',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  });

  it('should not fail if exec sync fails', () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    expect(getGitRepo(tree)).toBeNull();
    expect(console.error).toHaveBeenCalledWith(`Could not resolve git repo remote url.`);
  });

  it('should not fail if exec sync returns empty', () => {
    (execSync as jest.Mock).mockReturnValue(null);

    expect(getGitRepo(tree)).toBeNull();
    expect(console.error).toHaveBeenCalledWith(`Could not resolve git repo remote url.`);
  });

  it('should return git repo slug', () => {
    (execSync as jest.Mock).mockReturnValue(`${gitRepo}.git\n`);

    expect(getGitRepoSlug(tree)).toBe('nx-squeezer/squeezer');
  });

  it('should empty return git repo slug', () => {
    (execSync as jest.Mock).mockReturnValue(null);

    expect(getGitRepoSlug(tree)).toBeNull();
  });
});
