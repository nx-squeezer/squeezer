import { convertNxGenerator } from '@nx/devkit';

import { renovateGenerator } from './generator';

export const renovateSchematic = convertNxGenerator(renovateGenerator);
