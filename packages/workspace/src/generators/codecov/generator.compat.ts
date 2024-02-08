import { convertNxGenerator } from '@nx/devkit';

import codecovGenerator from './generator';

/**
 * Angular schematic to setup codecov.
 */
export const codecovSchematic = convertNxGenerator(codecovGenerator);
