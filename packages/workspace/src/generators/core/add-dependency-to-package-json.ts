import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';

import { getNpmPackageVersion } from './get-npm-package-version';

export function addDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' }, {});
}
