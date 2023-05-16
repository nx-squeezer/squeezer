import { convertNxGenerator } from '@nx/devkit';

import { eslintGenerator } from './generator';

export const eslintSchematic = convertNxGenerator(eslintGenerator);
