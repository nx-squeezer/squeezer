import { convertNxGenerator } from '@nrwl/devkit';

import { eslintGenerator } from './generator';

export const eslintSchematic = convertNxGenerator(eslintGenerator);
