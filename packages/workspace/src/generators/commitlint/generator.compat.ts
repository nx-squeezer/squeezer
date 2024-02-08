import { convertNxGenerator } from '@nx/devkit';

import commitlintGenerator from './generator';

/**
 * Angular schematic to setup commitlint.
 */
export const commitlintSchematic = convertNxGenerator(commitlintGenerator);
