import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';

import { getNpmPackageVersion } from '../npm';

export function addDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' }, {});
}
