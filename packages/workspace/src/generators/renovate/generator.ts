import { formatFiles, generateFiles, Tree } from '@nrwl/devkit';
import { parseDocument, Scalar, stringify, YAMLSeq } from 'yaml';

import { ciFile } from '../github-workflow';
import { addBadgeToReadme, getGitRepoSlug, joinNormalize, securityFile } from '../lib';
import { renovateCiFile, renovateBranch } from './renovate';
import { renovateConfigValidatorTask } from './renovate-config-validator-task';
import { RenovateGeneratorSchema } from './schema';

export async function renovateGenerator(tree: Tree, options: RenovateGeneratorSchema) {
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

  // Generate files

  const templateOptions = { ...options, gitRepoSlug, assignee: options.assignee ?? '', tmpl: '' };
  generateFiles(tree, joinNormalize(__dirname, 'files'), '.', templateOptions);

  if (options.local) {
    generateFiles(tree, joinNormalize(__dirname, 'presets'), '.', templateOptions);
  }

  if (!tree.exists(securityFile)) {
    generateFiles(tree, joinNormalize(__dirname, 'security'), '.', templateOptions);
  }

  // Update CI

  if (!tree.exists(ciFile)) {
    throw new Error(`Renovate needs a GitHub workflow CI file, none found at: ${ciFile}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ci = parseDocument(tree.read(ciFile)!.toString());
  const pushBranches: YAMLSeq<Scalar> = ci.getIn(['on', 'push', 'branches']) as YAMLSeq<Scalar>;
  if (!pushBranches.items.map((item) => item.value).includes(renovateBranch)) {
    pushBranches.add(new Scalar(renovateBranch));
  }
  tree.write(ciFile, stringify(ci));

  // Add badge to README.md

  addBadgeToReadme(
    tree,
    'https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot',
    null,
    'renovate'
  );

  await formatFiles(tree);

  return () => {
    renovateConfigValidatorTask(tree);
  };
}
