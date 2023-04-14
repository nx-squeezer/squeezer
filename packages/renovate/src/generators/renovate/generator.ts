import { formatFiles, Tree } from '@nrwl/devkit';

import { RenovateGeneratorSchema } from './schema';

export default async function (tree: Tree, options: RenovateGeneratorSchema) {
  await formatFiles(tree);
}
