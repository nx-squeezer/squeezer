import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';

import { getNpmPackageVersion } from '../npm';

export function addDevDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, {}, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' });
}
