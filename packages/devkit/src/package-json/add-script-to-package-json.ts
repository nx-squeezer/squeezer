import { Tree } from '@nx/devkit';

import { readPackageJson, writePackageJson } from './package-json';

/**
 * Generator that adds a script to root package.json file.
 */
export function addScriptToPackageJson(tree: Tree, name: string, script: string) {
  const packageJson = readPackageJson(tree);

  if (packageJson.scripts?.[name] != null) {
    console.log(`Skipping adding script to package.json: ${name}`);
    return;
  }

  packageJson.scripts = { ...packageJson.scripts, [name]: script };

  writePackageJson(tree, packageJson);
}
