import { convertNxGenerator } from '@nx/devkit';

import tsConfigGenerator from './generator';

export const tsConfigSchematic = convertNxGenerator(tsConfigGenerator);
