import { Tree } from '@nx/devkit';
import { parseDocument, stringify, YAMLSeq } from 'yaml';

export const ciFile = './.github/workflows/ci.yml';

export interface GitHubActionJobStep {
  name: string;
  uses?: string;
  if?: string;
  with?: { [key: string]: string | number | boolean };
  run?: string;
}

export function existsGitHubCiWorkflow(tree: Tree): boolean {
  return tree.exists(ciFile);
}

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
