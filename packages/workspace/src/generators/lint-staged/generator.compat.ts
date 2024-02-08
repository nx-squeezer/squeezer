import { convertNxGenerator } from '@nx/devkit';

import lintStagedGenerator from './generator';

/**
 * Angular schematic to setup lint-staged and husky.
 */
export const lintStagedSchematic = convertNxGenerator(lintStagedGenerator);
