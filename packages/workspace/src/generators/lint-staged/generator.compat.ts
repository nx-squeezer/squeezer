import { convertNxGenerator } from '@nrwl/devkit';

import { lintStagedGenerator } from './generator';

export const lintStagedSchematic = convertNxGenerator(lintStagedGenerator);
