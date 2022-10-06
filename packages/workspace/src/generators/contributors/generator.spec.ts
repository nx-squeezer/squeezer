import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getGitRepoSlug, readmeFile } from '../core';
import generator from './generator';

jest.mock('../core/get-git-repo');

describe('@nx-squeezer/workspace contributors generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.write(readmeFile, `# Repo\n\n`);
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    (getGitRepoSlug as jest.Mock).mockReturnValue('test/test');
  });

  it('should run successfully', async () => {
    await generator(tree);
  });

  it('should fail if Readme does not exist', async () => {
    tree.delete(readmeFile);

    await expect(async () => await generator(tree)).rejects.toEqual(new Error(`Missing Readme file at: ${readmeFile}`));
  });

  it('should fail if remote repo can not be resolved', async () => {
    (getGitRepoSlug as jest.Mock).mockReturnValue(null);

    await expect(async () => await generator(tree)).rejects.toEqual(new Error(`Remote repo could not be detected.`));
  });

  it('should add the contributors section and image', async () => {
    await generator(tree);

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain(`## Contributors`);
    expect(readme).toContain(`![contributors]`);
  });

  it('should not add the contributors section if already existing', async () => {
    await generator(tree);
    await generator(tree);

    expect(console.log).toHaveBeenCalledWith(`Contributors section already existing at: ${readmeFile}`);
  });
});
