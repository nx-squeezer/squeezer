import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { getNpmPackageVersion } from '../npm';

export function addDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' }, {});
}
