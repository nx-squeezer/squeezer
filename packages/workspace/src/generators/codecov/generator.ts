import { formatFiles, Tree } from '@nrwl/devkit';
import fetch from 'node-fetch-commonjs';

import { existsGitHubCiWorkflow, addGitHubCiJobStep } from '../github-workflow';
import { addBadgeToReadme, addImplicitDependencyToNxConfig, getGitRepoSlug } from '../lib';
import { writeProjectsToCodecov, getCodecovFile, readRawCodecov } from './codecov';

export async function codecovGenerator(tree: Tree) {
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
    console.error(`Codecov needs to be called from a CI pipeline, but it could not be found.`);
    console.error(`Try to generate it first using nx g @nx-squeezer/workspace:github-workflow`);
  }

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

  await formatFiles(tree);
}
