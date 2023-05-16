import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { getNpmPackageVersion } from '../npm';

export function addDevDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, {}, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' });
}
