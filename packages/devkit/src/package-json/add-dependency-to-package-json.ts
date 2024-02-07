import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { getNpmPackageVersion } from '../npm';

/**
 * Generator that adds a dependency to package.json.
 */
export function addDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' }, {});
}
