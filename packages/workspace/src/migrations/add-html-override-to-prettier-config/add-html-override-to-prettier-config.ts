import { formatFiles, readJson, Tree, writeJson } from '@nx/devkit';
import { SchemaForPrettierrc } from '@schemastore/prettierrc';

import { prettierConfigJsonFile } from '../../generators';

/**
 * Nx migration to add html to prettier configuration.
 */
export default async function addHtmlOverrideToPrettierConfig(tree: Tree) {
  if (!tree.exists(prettierConfigJsonFile)) {
    return;
  }

  const prettierConfig = readJson<Exclude<SchemaForPrettierrc, string>>(tree, prettierConfigJsonFile);
  const overrides = prettierConfig.overrides ?? [];
  if (overrides.find((rule) => rule.files === '*.html') != null) {
    return;
  }

  prettierConfig.overrides = [
    ...overrides,
    {
      files: '*.html',
      options: {
        parser: 'html',
      },
    },
  ];

  writeJson(tree, prettierConfigJsonFile, prettierConfig);

  await formatFiles(tree);
}
