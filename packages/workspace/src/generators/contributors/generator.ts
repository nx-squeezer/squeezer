import { formatFiles, Tree } from '@nrwl/devkit';

import { getGitRepoSlug, readmeFile } from '../core';

export default async function (tree: Tree) {
  if (!tree.exists(readmeFile)) {
    throw new Error(`Missing Readme file at: ${readmeFile}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  let readme = tree.read(readmeFile)!.toString();

  const repoSlug = getGitRepoSlug(tree);

  if (repoSlug == null) {
    throw new Error(`Remote repo could not be detected.`);
  }

  if (readme.includes(`## Contributors`)) {
    console.log(`Contributors section already existing at: ${readmeFile}`);
    return;
  }

  const link = `https://contrib.rocks/image?repo=${repoSlug}`;
  const image = `https://github.com/${repoSlug}/graphs/contributors`;
  readme += `## Contributors\n\n[![contributors](${link})](${image})\n`;

  tree.write(readmeFile, readme);

  await formatFiles(tree);
}
