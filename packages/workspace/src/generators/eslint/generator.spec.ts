import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree } from '@nrwl/devkit';

import generator from './generator';
import { EsLintGeneratorSchema } from './schema';
import { readEsLintConfig, writeEsLintConfig } from '../core';

describe('@nx-squeezer/workspace eslint generator', () => {
  let tree: Tree;
  const options: EsLintGeneratorSchema = { eslintRecommended: true };

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await generator(tree, options);

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should apply eslint:recommended', async () => {
    await generator(tree, options);

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.overrides?.[0]).toStrictEqual({
      files: ['*.js', '*.jsx'],
      extends: ['eslint:recommended'],
      rules: {},
    });
  });
});
