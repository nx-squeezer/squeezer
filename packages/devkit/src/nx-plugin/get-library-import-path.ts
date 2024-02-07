/* istanbul ignore file */

import { ProjectGraph } from '@nx/devkit';

import { readTsPathMappings } from './typescript';

/**
 * https://github.com/nrwl/nx/blob/master/packages/devkit/src/utils/module-federation/dependencies.ts
 *
 * @ignore
 */
export function getLibraryImportPath(library: string, projectGraph: ProjectGraph): string | undefined {
  const tsConfigPathMappings = readTsPathMappings();

  if (tsConfigPathMappings == null) {
    return undefined;
  }

  const sourceRoot = projectGraph.nodes[library].data.sourceRoot;
  if (sourceRoot == null) {
    return undefined;
  }

  for (const [key, value] of Object.entries(tsConfigPathMappings)) {
    if (value.find((path) => path.startsWith(sourceRoot))) {
      return key;
    }
  }

  return undefined;
}
