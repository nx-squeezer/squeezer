import { Tree } from '@nrwl/devkit';

import { readPackageJson, writePackageJson } from './package-json';

export function addScriptToPackageJson(tree: Tree, name: string, script: string) {
  const packageJson = readPackageJson(tree);

  if (packageJson.scripts?.[name] != null) {
    console.log(`Skipping adding script to package.json: ${name}`);
    return;
  }

  packageJson.scripts = { ...packageJson.scripts, [name]: script };

  writePackageJson(tree, packageJson);
}
