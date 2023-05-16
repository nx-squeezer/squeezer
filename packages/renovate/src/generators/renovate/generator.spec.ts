import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import generator from './generator';
import { RenovateGeneratorSchema } from './schema';

describe('renovate generator', () => {
  let appTree: Tree;
  const options: RenovateGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    expect(appTree).toBeDefined();
  });
});
