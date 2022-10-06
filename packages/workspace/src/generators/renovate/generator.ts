import { formatFiles, generateFiles, Tree } from '@nrwl/devkit';

import { getGitRepoSlug, joinNormalize, renovateCiFile } from '../core';
import { RenovateGeneratorSchema } from './schema';

export default async function (tree: Tree, options: RenovateGeneratorSchema) {
  if (!options.force && tree.exists(renovateCiFile)) {
    console.log(`Renovate workflow already existing at path: ${renovateCiFile}`);
    return;
  }

  if (options.useNxCloud) {
    console.log(`In order to use Nx Cloud add a secret with the NX_CLOUD_AUTH_TOKEN`);
    console.log(`It is suggested that you create a new token for this purpose with read/write access.`);
    console.log(`You can configure it at: https://cloud.nx.app/`);
    console.log(`Also consider using Nx Cloud GitHub app to access run results: https://github.com/apps/nx-cloud`);
    console.log();
  }

  const gitRepoSlug = getGitRepoSlug(tree);
  if (gitRepoSlug == null) {
    throw new Error(`Could not identify GitHub repo slug.`);
  }

  const templateOptions = { ...options, gitRepoSlug, assignee: options.assignee ?? '', tmpl: '' };
  generateFiles(tree, joinNormalize(__dirname, 'files'), '.', templateOptions);

  if (options.local) {
    generateFiles(tree, joinNormalize(__dirname, 'presets'), '.', templateOptions);
  }

  await formatFiles(tree);
}
