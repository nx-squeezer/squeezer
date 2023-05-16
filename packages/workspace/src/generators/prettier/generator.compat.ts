import { convertNxGenerator } from '@nx/devkit';

import { prettierGenerator } from './generator';

export const prettierSchematic = convertNxGenerator(prettierGenerator);
