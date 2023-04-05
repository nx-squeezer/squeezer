import { readFileSync, writeFileSync } from 'fs';

import { workspaceRoot } from '@nrwl/devkit';
import { cleanup, tmpProjPath } from '@nrwl/nx-plugin/testing';
import { ensureDirSync } from 'fs-extra';

import { runNxNewCommand } from './run-nx-new-command';
import { runPackageManagerInstall } from './run-package-manager-install';
import { packageJsonFile } from '../package-json';

export type PluginInput = [npmPackageName: string, pluginDistPath: string];

// https://github.com/Bielik20/nx-plugins/blob/3a0ea8e20a4481540634dbd125d057817e6b479e/packages/nx-core/src/testing-utils/ensure-complex-nx-project.ts
export function ensureComplexNxProject(...inputs: PluginInput[]): void {
  ensureDirSync(tmpProjPath());
  cleanup();
  runNxNewCommand();
  patchPackageJsonForPlugins(inputs);
  runPackageManagerInstall();
}

function patchPackageJsonForPlugins(inputs: PluginInput[]) {
  const packageJsonPath = tmpProjPath(packageJsonFile);
  const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());

  inputs.forEach(([npmPackageName, pluginDistPath]) => {
    packageJson.devDependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
    updatePackageInDist([npmPackageName, pluginDistPath], inputs);
  });

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function updatePackageInDist(target: PluginInput, inputs: PluginInput[]) {
  const packageJsonPath = `${workspaceRoot}/${target[1]}/${packageJsonFile}`;
  const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
  let updated = false;

  inputs
    .filter(([npmPackageName]) => packageJson.dependencies != null && npmPackageName in packageJson.dependencies)
    .forEach(([npmPackageName, pluginDistPath]) => {
      packageJson.dependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
      updated = true;
    });

  inputs
    .filter(
      ([npmPackageName]) => packageJson.peerDependencies != null && npmPackageName in packageJson.peerDependencies
    )
    .forEach(([npmPackageName, pluginDistPath]) => {
      packageJson.peerDependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
      updated = true;
    });

  if (!updated) {
    return;
  }

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  runPackageManagerInstall(`${workspaceRoot}/${target[1]}`);
}
