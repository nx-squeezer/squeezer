import { convertNxGenerator } from '@nrwl/devkit';

import { tsConfigGenerator } from './generator';

export const tsConfigSchematic = convertNxGenerator(tsConfigGenerator);
