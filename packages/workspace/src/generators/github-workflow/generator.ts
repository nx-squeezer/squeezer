import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';

import {
  joinNormalize,
  addImplicitDependencyToNxConfig,
  addScriptToPackageJson,
  getGitRepo,
  addBadgeToReadme,
  ciFile,
} from '@nx-squeezer/devkit';

import { GitHubWorkflowGeneratorSchema } from './schema';

export async function gitHubWorkflowGenerator(tree: Tree, options: GitHubWorkflowGeneratorSchema) {
  if (!options.force && tree.exists(ciFile)) {
    console.log(`GitHub workflow already existing at path: ${ciFile}`);
    return;
  }

  if (options.useNxCloud) {
    console.log(`In order to use Nx Cloud add a secret with the NX_CLOUD_AUTH_TOKEN`);
    console.log(`It is suggested that you create a new token for this purpose with read/write access.`);
    console.log(`You can configure it at: https://cloud.nx.app/`);
    console.log(`Also consider using Nx Cloud GitHub app to access run results: https://github.com/apps/nx-cloud`);
    console.log();
  }

  const targets = ['build', 'lint', 'test', 'e2e'].map((target) => {
    const formattedNames = names(target);
    formattedNames.className = formattedNames.className.replace(/e2e/i, 'e2e');
    return formattedNames;
  });
  const templateOptions = { ...options, targets, tmpl: '' };

  generateFiles(tree, joinNormalize(__dirname, 'files'), '.github/workflows', templateOptions);
  addImplicitDependencyToNxConfig(tree, { '.github/workflows/*.yml': '*' });
  addScriptToPackageJson(tree, 'nx', 'nx');
  addScriptToPackageJson(tree, 'lint:workspace', 'nx workspace-lint');

  const gitRepo = getGitRepo(tree);
  if (gitRepo == null) {
    console.error(`Could not add badge to README, remote repo could not be detected.`);
  } else {
    addBadgeToReadme(
      tree,
      `${gitRepo}/actions/workflows/ci.yml/badge.svg`,
      `${gitRepo}/actions/workflows/ci.yml`,
      'CI',
      true
    );
  }

  await formatFiles(tree);
}
