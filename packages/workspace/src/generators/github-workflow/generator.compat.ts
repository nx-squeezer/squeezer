import { convertNxGenerator } from '@nrwl/devkit';

import { gitHubWorkflowGenerator } from './generator';

export const gitHubWorkflowSchematic = convertNxGenerator(gitHubWorkflowGenerator);
