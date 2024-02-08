import { convertNxGenerator } from '@nx/devkit';

import eslintGenerator from './generator';

/**
 * Angular schematic to setup ESLint in a workspace.
 */
export const eslintSchematic = convertNxGenerator(eslintGenerator);
