import { Tree } from '@nrwl/devkit';
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

export function additHubCiJobStep(tree: Tree, job: string, step: GitHubActionJobStep) {
  const ci = parseDocument(tree.read(ciFile)?.toString() ?? '');
  const testSteps: YAMLSeq | undefined = ci.getIn(['jobs', 'test', 'steps']) as any;

  if (testSteps == null) {
    console.log(`Could not find "${job}" job in file: ${ciFile}`);
    return;
  }

  if (testSteps.items.some((item: any) => item.get('name') === step.name)) {
    console.log(`Step "${step.name}" in "${job}" already present in file: ${ciFile}`);
    return;
  }

  testSteps.add(step);

  tree.write(ciFile, stringify(ci));
}
