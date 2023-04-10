/* istanbul ignore file */
import {
  createProjectGraphAsync,
  getDependentPackagesForProject,
  ProjectGraph,
  ProjectGraphProjectNode,
  readJsonFile,
  WorkspaceLibrary,
  workspaceRoot,
  writeJsonFile,
} from '@nrwl/devkit';
import { cleanup, tmpProjPath } from '@nrwl/nx-plugin/testing';
import { ensureDirSync } from 'fs-extra';

import { getLibraryImportPath } from './get-library-import-path';
import { runNxNewCommand } from './run-nx-new-command';
import { runPackageManagerInstall } from './run-package-manager-install';
import { readTsPathMappings } from './typescript';
import { packageJsonFile } from '../package-json';

export interface Plugin {
  npmPackageName: string;
  pluginDistPath: string;
  workspaceLibraries: WorkspaceLibrary[];
}

// Inspiration:
// https://github.com/Bielik20/nx-plugins/blob/3a0ea8e20a4481540634dbd125d057817e6b479e/packages/nx-core/src/testing-utils/ensure-complex-nx-project.ts
export async function ensureNxProject(npmPackageName?: string, pluginDistPath?: string): Promise<void>;
export async function ensureNxProject(...projectNames: string[]): Promise<void>;
export async function ensureNxProject(...projectNames: (string | undefined)[]): Promise<void> {
  ensureDirSync(tmpProjPath());
  cleanup();
  runNxNewCommand();

  if (
    projectNames.length === 2 &&
    projectNames[0] != null && // npmPackageName
    projectNames[1] != null && // pluginDistPath
    (readTsPathMappings() ?? {})[projectNames[0]] // Detect if the first parameter is a valid TS mapping, revealing it is not a project
  ) {
    // Check if the caller is using the legacy system based on package name and dist path
    console.warn(
      `Instead of calling ensureNxProject with ${projectNames[0]} and its dist folder, pass the project name.`
    );
    patchPackageJsonForPlugin(projectNames[0], projectNames[1]);
  } else {
    const projectGraph = await createProjectGraphAsync();
    const projectDependencyMap = new Map<string, Plugin>();
    const sanitizedProjectNames = projectNames.filter((name): name is string => name != null); // TODO: Remove once package signature is removed
    sanitizedProjectNames.forEach((name) => patchProjectDistFolder(projectGraph, projectDependencyMap, name));
    sanitizedProjectNames.forEach((name) => updatePackageInRoot(projectDependencyMap, name));
  }

  runPackageManagerInstall();
}

function patchPackageJsonForPlugin(npmPackageName: string, distPath: string) {
  const path = tmpProjPath('package.json');
  const json = readJsonFile(path);
  json.devDependencies[npmPackageName] = `file:${workspaceRoot}/${distPath}`;
  writeJsonFile(path, json);
}

function patchProjectDistFolder(projectGraph: ProjectGraph, projectDependencyMap: Map<string, Plugin>, name: string) {
  if (projectDependencyMap.has(name)) {
    return;
  }

  const plugin = getPlugin(projectGraph, name);
  projectDependencyMap.set(name, plugin);

  plugin.workspaceLibraries.forEach((library) =>
    patchProjectDistFolder(projectGraph, projectDependencyMap, library.name)
  );

  if (plugin.workspaceLibraries.length > 0) {
    updatePackageInDist(projectDependencyMap, plugin);
    runPackageManagerInstall(`${workspaceRoot}/${plugin.pluginDistPath}`);
  }
}

function getPlugin(projectGraph: ProjectGraph, name: string): Plugin {
  const npmPackageName = getLibraryImportPath(name, projectGraph);

  if (npmPackageName == null) {
    throw new Error(`Project "${name}" does not have an import path in tsconfig`);
  }

  return {
    npmPackageName,
    pluginDistPath: getOutputPath(projectGraph, name),
    workspaceLibraries: getDependentPackagesForProject(projectGraph, name).workspaceLibraries,
  };
}

function getProjectNode(projectGraph: ProjectGraph, name: string): ProjectGraphProjectNode {
  const node = projectGraph.nodes[name];
  if (node == null) {
    throw new Error(`Could not find project with name "${name}"`);
  }
  return node;
}

function getOutputPath(projectGraph: ProjectGraph, name: string): string {
  const node = getProjectNode(projectGraph, name);
  const buildTarget = node.data.targets?.build;
  if (buildTarget == null) {
    throw new Error(`Project "${name}" does not have build target, output path can't be inferred`);
  }

  const outputPath: string | undefined = buildTarget.options.outputPath;
  if (outputPath == null) {
    throw new Error(`Project "${name}" does not have an output path on its build target`);
  }

  return outputPath;
}

function updatePackageInRoot(projectDependencyMap: Map<string, Plugin>, name: string) {
  const plugin = projectDependencyMap.get(name);
  if (plugin == null || plugin.workspaceLibraries.length === 0) {
    return;
  }

  const packageJsonPath = tmpProjPath(packageJsonFile);
  const packageJson = readJsonFile(packageJsonPath);

  packageJson.devDependencies[plugin.npmPackageName] = `file:${workspaceRoot}/${plugin.pluginDistPath}`;

  writeJsonFile(packageJsonPath, packageJson);
}

function updatePackageInDist(projectDependencyMap: Map<string, Plugin>, plugin: Plugin) {
  const packageJsonPath = `${workspaceRoot}/${plugin.pluginDistPath}/${packageJsonFile}`;
  const packageJson = readJsonFile(packageJsonPath);

  for (const { npmPackageName, pluginDistPath } of projectDependencyMap.values()) {
    if (packageJson.dependencies != null && npmPackageName in packageJson.dependencies) {
      packageJson.dependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
    }
    if (packageJson.peerDependencies != null && npmPackageName in packageJson.peerDependencies) {
      packageJson.peerDependencies[npmPackageName] = `file:${workspaceRoot}/${pluginDistPath}`;
    }
  }

  writeJsonFile(packageJsonPath, packageJson);
}
