import { convertNxGenerator } from '@nrwl/devkit';

import { prettierGenerator } from './generator';

export const prettierSchematic = convertNxGenerator(prettierGenerator);
