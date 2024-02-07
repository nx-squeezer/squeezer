import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

import { getNpmPackageVersion } from '../npm';

/**
 * Generator that adds a dev dependency to package.json.
 */
export function addDevDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, {}, { [packageName]: getNpmPackageVersion(packageName) ?? 'latest' });
}
