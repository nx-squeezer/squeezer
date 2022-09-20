import { Tree } from '@nrwl/devkit';

export const readmeFile = 'README.md';
const titleRegex = /^#\s+/;
const badgesRegex = /^\s*(\[!\[.+\]\(.+\)\]\(.+\)\s*)+/;

export function addBadgeToReadme(tree: Tree, badge: string, link: string, description: string, beginning = false) {
  const readme = tree.read(readmeFile)?.toString() ?? '';
  const badgeMarkdown = `[![${description}](${badge})](${link})`;

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
