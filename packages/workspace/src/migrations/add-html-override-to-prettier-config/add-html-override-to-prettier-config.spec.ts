import { readJson, Tree, writeJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import addHtmlOverrideToPrettierConfig from './add-html-override-to-prettier-config';
import { prettierConfigFile, prettierConfigJsonFile } from '../../generators';

const htmlOverride = {
  files: '*.html',
  options: {
    parser: 'html',
  },
};

describe('@nx-squeezer/workspace add html override to prettier config migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    tree.delete(prettierConfigFile);
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should run successfully', async () => {
    await addHtmlOverrideToPrettierConfig(tree);
  });

  it('should add overrides configuration if it did not exist', async () => {
    writeJson(tree, prettierConfigJsonFile, {});

    await addHtmlOverrideToPrettierConfig(tree);

    expect(readJson(tree, prettierConfigJsonFile)).toStrictEqual({
      overrides: [htmlOverride],
    });
  });

  it('should add overrides configuration if it existed', async () => {
    writeJson(tree, prettierConfigJsonFile, { overrides: [] });

    await addHtmlOverrideToPrettierConfig(tree);

    expect(readJson(tree, prettierConfigJsonFile)).toStrictEqual({
      overrides: [htmlOverride],
    });
  });

  it('should not add overrides configuration if already present', async () => {
    writeJson(tree, prettierConfigJsonFile, {
      overrides: [htmlOverride],
    });

    await addHtmlOverrideToPrettierConfig(tree);

    expect(readJson(tree, prettierConfigJsonFile)).toStrictEqual({
      overrides: [htmlOverride],
    });
  });
});
