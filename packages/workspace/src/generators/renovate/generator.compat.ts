import { convertNxGenerator } from '@nrwl/devkit';

import { renovateGenerator } from './generator';

export const renovateSchematic = convertNxGenerator(renovateGenerator);
