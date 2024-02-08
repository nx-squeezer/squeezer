import { convertNxGenerator } from '@nx/devkit';

import tsConfigGenerator from './generator';

/**
 * Angular schematic to setup tsconfig and fix issues in the workspace.
 */
export const tsConfigSchematic = convertNxGenerator(tsConfigGenerator);
