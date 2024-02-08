import { convertNxGenerator } from '@nx/devkit';

import gitHubWorkflowGenerator from './generator';

/**
 * Angular schematic to setup a CI GitHub workflow.
 */
export const gitHubWorkflowSchematic = convertNxGenerator(gitHubWorkflowGenerator);
