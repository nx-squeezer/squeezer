import { convertNxGenerator } from '@nrwl/devkit';

import { codecovGenerator } from './generator';

export const codecovSchematic = convertNxGenerator(codecovGenerator);
