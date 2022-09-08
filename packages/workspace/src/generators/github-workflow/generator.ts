import { GitHubWorkflowGeneratorSchema } from './schema';

import * as path from 'path';
import { generateFiles, names, Tree } from '@nrwl/devkit';

export const ciFile = './.github/workflows/ci.yml';

export default async function (tree: Tree, options: GitHubWorkflowGeneratorSchema) {
  if (tree.exists(ciFile)) {
    console.log(`GitHub workflow already existing at path: ${ciFile}`);
    return;
  }

  if (options.useNxCloud) {
    console.log(`In order to use Nx Cloud add a secret with the NX_CLOUD_AUTH_TOKEN`);
    console.log(`It is suggested that you create a new token for this purpose with read/write access.`);
    console.log(`You can configure it at: https://cloud.nx.app/`);
    console.log();
  }

  const targets = ['build', 'lint', 'e2e'].map((target) => names(target));
  const templateOptions = { ...options, targets, tmpl: '' };

  generateFiles(tree, path.join(__dirname, 'files'), './.github/workflows', templateOptions);
}
