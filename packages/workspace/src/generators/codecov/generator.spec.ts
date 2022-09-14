import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import fetch from 'node-fetch-commonjs';

import { readCodecov } from '../core';
import generator from './generator';

jest.mock('node-fetch-commonjs');

describe('@nx-squeezer/workspace codecov generator', () => {
  let tree: Tree;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    (fetch as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('should run successfully', async () => {
    await generator(tree);

    const codecov = readCodecov(tree);

    expect(codecov).toBeDefined();
  });
});
