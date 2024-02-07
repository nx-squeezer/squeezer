import { Tree } from '@nx/devkit';

import { readmeFile } from './readme';

/** Regex to get the main title in a markdown file. */
const titleRegex = /^#\s+/;

/** Regex to find an image in a markdown file. */
const badgesRegex = /^\s*(\[!\[.+\]\(.+\)\]\(.+\)\s*)+/;

/**
 * Generator that adds a badge to the readme file.
 */
export function addBadgeToReadme(
  tree: Tree,
  badgeImg: string,
  link: string | null,
  description: string,
  beginning = false
) {
  const readme = tree.read(readmeFile)?.toString() ?? '';
  const badgeMarkdown = link ? `[![${description}](${badgeImg})](${link})` : `![${description}](${badgeImg})`;

  if (readme.includes(badgeMarkdown)) {
    console.log(`Badge for ${description} already present in ${readmeFile}`);
    return;
  }

  const readmeLines: string[] = readme.split('\n');

  let titleLine = 0;
  let badgesLine = 0;

  // Find main title
  for (let line = 0; line < readmeLines.length; line++) {
    if (readmeLines[line].match(titleRegex)) {
      titleLine = line;
      break;
    }
  }

  // Find badges line
  for (let line = titleLine; line < readmeLines.length; line++) {
    if (readmeLines[line].match(badgesRegex)) {
      badgesLine = line;
      break;
    }
  }

  // Add badge
  if (badgesLine === 0) {
    // Badges line not existing
    readmeLines.splice(titleLine + 1, 0, '', '');
    badgesLine = titleLine + 2;
  }

  readmeLines[badgesLine] = beginning
    ? `${badgeMarkdown} ${readmeLines[badgesLine]}`
    : `${readmeLines[badgesLine]} ${badgeMarkdown}`;

  readmeLines[badgesLine] = readmeLines[badgesLine].trim();

  tree.write(readmeFile, readmeLines.join('\n'));
}
