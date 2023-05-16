import { convertNxGenerator } from '@nx/devkit';

import { gitHubWorkflowGenerator } from './generator';

export const gitHubWorkflowSchematic = convertNxGenerator(gitHubWorkflowGenerator);
