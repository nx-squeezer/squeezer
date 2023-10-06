import { convertNxGenerator } from '@nx/devkit';

import lintStagedGenerator from './generator';

export const lintStagedSchematic = convertNxGenerator(lintStagedGenerator);
