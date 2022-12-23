import { convertNxGenerator } from '@nrwl/devkit';

import { contributorsGenerator } from './generator';

export const contributorsSchematic = convertNxGenerator(contributorsGenerator);
