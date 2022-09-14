import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

export const packageJsonFile = 'package.json';

export function readPackageJson(tree: Tree): JSONSchemaForNPMPackageJsonFiles {
  return readJson<JSONSchemaForNPMPackageJsonFiles>(tree, packageJsonFile);
}

export function writePackageJson(tree: Tree, packageJson: JSONSchemaForNPMPackageJsonFiles): void {
  return writeJson<JSONSchemaForNPMPackageJsonFiles>(tree, packageJsonFile, packageJson);
}
