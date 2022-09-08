import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree } from '@nrwl/devkit';

import generator, { ciFile } from './generator';

describe('@nx-squeezer/workspace github workflow generator', () => {
  let appTree: Tree;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, { branch: 'main', useNxCloud: true });

    const ciWorkflow = appTree.read(ciFile)?.toString();

    expect(ciWorkflow).toBeDefined();
  });
});
