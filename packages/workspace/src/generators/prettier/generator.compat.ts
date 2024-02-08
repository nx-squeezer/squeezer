import { convertNxGenerator } from '@nx/devkit';

import prettierGenerator from './generator';

/**
 * Angular schematic to setup prettier and format files in the workspace.
 */
export const prettierSchematic = convertNxGenerator(prettierGenerator);
