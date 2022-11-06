import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getGitRepoSlug, readmeFile } from '../lib';
import { contributorsGenerator } from './generator';
import { contributorsSchematic } from './generator.compat';

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
    await contributorsGenerator(tree);
  });

  it('should provide a schematic', async () => {
    expect(typeof contributorsSchematic({})).toBe('function');
  });

  it('should fail if Readme does not exist', async () => {
    tree.delete(readmeFile);

    await expect(async () => await contributorsGenerator(tree)).rejects.toEqual(
      new Error(`Missing Readme file at: ${readmeFile}`)
    );
  });

  it('should fail if remote repo can not be resolved', async () => {
    (getGitRepoSlug as jest.Mock).mockReturnValue(null);

    await expect(async () => await contributorsGenerator(tree)).rejects.toEqual(
      new Error(`Remote repo could not be detected.`)
    );
  });

  it('should add the contributors section and image', async () => {
    await contributorsGenerator(tree);

    const readme = tree.read(readmeFile)?.toString() ?? '';

    expect(readme).toContain(`## Contributors`);
    expect(readme).toContain(`![contributors]`);
  });

  it('should not add the contributors section if already existing', async () => {
    await contributorsGenerator(tree);
    await contributorsGenerator(tree);

    expect(console.log).toHaveBeenCalledWith(`Contributors section already existing at: ${readmeFile}`);
  });
});
