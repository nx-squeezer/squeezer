import { formatFiles, Tree } from '@nrwl/devkit';

export default async function (tree: Tree) {
  await formatFiles(tree);
}
