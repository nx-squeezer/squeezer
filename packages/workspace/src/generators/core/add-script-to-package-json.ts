import { readJson, Tree, writeJson } from '@nrwl/devkit';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

export function addScriptToPackageJson(tree: Tree, name: string, script: string) {
  const packageJson = readJson<JSONSchemaForNPMPackageJsonFiles>(tree, 'package.json');

  if (packageJson.scripts?.[name] != null) {
    console.log(`Skipping adding script to package.json: ${name}`);
    return;
  }

  packageJson.scripts = { ...packageJson.scripts, [name]: script };

  writeJson(tree, 'package.json', packageJson);
}
