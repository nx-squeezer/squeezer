import { convertNxGenerator } from '@nx/devkit';

import { codecovGenerator } from './generator';

export const codecovSchematic = convertNxGenerator(codecovGenerator);
