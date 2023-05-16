import { convertNxGenerator } from '@nx/devkit';

import { contributorsGenerator } from './generator';

export const contributorsSchematic = convertNxGenerator(contributorsGenerator);
