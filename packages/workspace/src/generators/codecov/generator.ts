import { formatFiles, Tree } from '@nrwl/devkit';
import fetch from 'node-fetch-commonjs';

import {
  addBadgeToReadme,
  addImplicitDependencyToNxConfig,
  addGitHubCiJobStep,
  existsGitHubCiWorkflow,
  getCodecovFile,
  getGitRepoSlug,
  readRawCodecov,
  writeProjectsToCodecov,
} from '../core';

export default async function (tree: Tree) {
  writeProjectsToCodecov(tree);
  addImplicitDependencyToNxConfig(tree, { [getCodecovFile(tree)]: '*' });

  if (existsGitHubCiWorkflow(tree)) {
    addGitHubCiJobStep(tree, 'test', {
      name: 'Codecov',
      uses: 'codecov/codecov-action@v3.1.0',
      if: `hashFiles('coverage/**/*') != ''`,
      with: {
        fail_ci_if_error: true,
        verbose: true,
      },
    });
  } else {
    console.log(`Codecov needs to be called from a CI pipeline, but it could not be found.`);
    console.log(`Try to generate it first using nx g @nx-squeezer/workspace:github-workflow`);
  }

  await formatFiles(tree);

  // Validate
  const response = await fetch(`https://api.codecov.io/validate`, { method: 'POST', body: readRawCodecov(tree) });
  if (response.ok) {
    console.log(`Codecov file was validated successfully`);
  } else {
    throw new Error(`Couldn't generate a valid Codecov file`);
  }

  console.log(`You can configure the Codecov app at: https://github.com/apps/codecov`);

  const gitRepoSlug = getGitRepoSlug(tree);
  if (gitRepoSlug == null) {
    console.error(`Could not add badge to README, remote repo could not be detected.`);
  } else {
    addBadgeToReadme(
      tree,
      `https://codecov.io/gh/${gitRepoSlug}/branch/main/graph/badge.svg`,
      `https://codecov.io/gh/${gitRepoSlug}`,
      'codecov'
    );
  }
}
