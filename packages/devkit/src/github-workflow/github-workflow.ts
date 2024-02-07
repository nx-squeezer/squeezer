import { Tree } from '@nx/devkit';
import { parseDocument, stringify, YAMLSeq } from 'yaml';

/** Filename of CI GitHub workflow file */
export const ciFile = './.github/workflows/ci.yml';

/**
 * Model of a GitHub action job step.
 */
export interface GitHubActionJobStep {
  /** Name */
  name: string;

  /** Uses */
  uses?: string;

  /** If condition */
  if?: string;

  /** With */
  with?: { [key: string]: string | number | boolean };

  /** Run */
  run?: string;
}

/**
 * Checks if the CI workflow file exists in the tree.
 */
export function existsGitHubCiWorkflow(tree: Tree): boolean {
  return tree.exists(ciFile);
}

/**
 * Add a job step in the CI workflow file.
 */
export function addGitHubCiJobStep(tree: Tree, job: string, step: GitHubActionJobStep) {
  const ci = parseDocument(tree.read(ciFile)?.toString() ?? '');
  const jobSteps: YAMLSeq | undefined = ci.getIn(['jobs', job, 'steps']) as any;

  if (jobSteps == null) {
    console.error(`Could not find "${job}" job in file: ${ciFile}`);
    return;
  }

  if (jobSteps.items.some((item: any) => item.get('name') === step.name)) {
    console.error(`Step "${step.name}" in "${job}" already present in file: ${ciFile}`);
    return;
  }

  jobSteps.add(step);

  tree.write(ciFile, stringify(ci));
}
