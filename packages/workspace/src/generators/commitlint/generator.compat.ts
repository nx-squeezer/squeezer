import { convertNxGenerator } from '@nrwl/devkit';

import { commitlintGenerator } from './generator';

export const commitlintSchematic = convertNxGenerator(commitlintGenerator);
