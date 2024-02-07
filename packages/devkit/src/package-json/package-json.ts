import { readJson, Tree, writeJson } from '@nx/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

/** Filename of package.json */
export const packageJsonFile = 'package.json';

/**
 * Gets and parses the content of root `package.json` content from a generator tree.
 */
export function readPackageJson(tree: Tree): JSONSchemaForNPMPackageJsonFiles {
  return readJson<JSONSchemaForNPMPackageJsonFiles>(tree, packageJsonFile);
}

/**
 * Updates `package.json` content from a generator tree.
 */
export function writePackageJson(tree: Tree, packageJson: JSONSchemaForNPMPackageJsonFiles): void {
  return writeJson<JSONSchemaForNPMPackageJsonFiles>(tree, packageJsonFile, packageJson);
}
