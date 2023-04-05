import { readFileSync, writeFileSync } from 'fs';

import { workspaceRoot } from '@nrwl/devkit';
import { cleanup, tmpProjPath } from '@nrwl/nx-plugin/testing';
import { ensureDirSync } from 'fs-extra';

import { runNxNewCommand } from './run-nx-new-command';
import { runPackageManagerInstall } from './run-package-manager-install';

export type PluginInput = [npmPackageName: string, pluginDistPath: string];

// https://github.com/Bielik20/nx-plugins/blob/3a0ea8e20a4481540634dbd125d057817e6b479e/packages/nx-core/src/testing-utils/ensure-complex-nx-project.ts
export function ensureComplexNxProject(...inputs: PluginInput[]): void {
  ensureDirSync(tmpProjPath());
  cleanup();
  runNxNewCommand('', true);
  patchPackageJsonForPlugins(inputs);
  runPackageManagerInstall();
}

function patchPackageJsonForPlugins(inputs: PluginInput[]) {
  const pPath = tmpProjPath('package.json');
  const p = JSON.parse(readFileSync(pPath).toString());

  inputs.forEach(([npmPackageName, pluginDistPath]) => {
    p.devDependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
    updatePackageInDist([npmPackageName, pluginDistPath], inputs);
  });

  writeFileSync(pPath, JSON.stringify(p, null, 2));
}

function updatePackageInDist(target: PluginInput, inputs: PluginInput[]) {
  const pPath = `${workspaceRoot}/${target[1]}/package.json`;
  const p = JSON.parse(readFileSync(pPath).toString());

  inputs
    .filter(([npmPackageName]) => p.dependencies != null && npmPackageName in p.dependencies)
    .forEach(([npmPackageName, pluginDistPath]) => {
      p.dependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
    });

  inputs
    .filter(([npmPackageName]) => p.peerDependencies != null && npmPackageName in p.peerDependencies)
    .forEach(([npmPackageName, pluginDistPath]) => {
      p.peerDependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
    });

  writeFileSync(pPath, JSON.stringify(p, null, 2));
  runPackageManagerInstall(`${workspaceRoot}/${target[1]}`);
}
