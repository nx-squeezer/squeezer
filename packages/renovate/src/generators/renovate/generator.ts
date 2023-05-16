import { formatFiles, Tree } from '@nx/devkit';

import { RenovateGeneratorSchema } from './schema';

export default async function (tree: Tree, options: RenovateGeneratorSchema) {
  await formatFiles(tree);
}
