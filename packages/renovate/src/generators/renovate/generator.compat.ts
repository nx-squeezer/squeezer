import { convertNxGenerator } from '@nx/devkit';

import renovateGenerator from './generator';

/**
 * Angular schematic that adds Renovate to a workspace.
 */
export const renovateSchematic = convertNxGenerator(renovateGenerator);
