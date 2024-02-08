import { convertNxGenerator } from '@nx/devkit';

import contributorsGenerator from './generator';

/**
 * Angular schematic to setup contributors in README.
 */
export const contributorsSchematic = convertNxGenerator(contributorsGenerator);
