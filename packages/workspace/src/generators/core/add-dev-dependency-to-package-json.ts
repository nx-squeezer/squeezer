import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';
import { getNpmPackageVersion } from './get-npm-package-version';

export function addDevDependencyToPackageJson(tree: Tree, packageName: string) {
  addDependenciesToPackageJson(tree, {}, { [packageName]: getNpmPackageVersion(packageName) ?? ' latest' });
}
