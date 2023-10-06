import { convertNxGenerator } from '@nx/devkit';

import commitlintGenerator from './generator';

export const commitlintSchematic = convertNxGenerator(commitlintGenerator);
