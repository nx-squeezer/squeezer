import { Tree } from '@nx/devkit';
import { createTree } from '@nx/devkit/testing';

import { addBadgeToReadme } from './add-badge-to-readme';
import { readmeFile } from './readme';

describe('@nx-squeezer/devkit addBadgeToReadme', () => {
  let tree: Tree;
  const badge = 'badge';
  const link = 'link';
  const description = 'description';
  const expectHasBadge = (tree: Tree) => {
    expect(tree.read(readmeFile)?.toString().includes(`(${badge})`)).toBeTruthy();
  };

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should add the badge to an existing README file', () => {
    tree.write(readmeFile, `# README`);

    addBadgeToReadme(tree, badge, link, description);

    expectHasBadge(tree);
  });

  it('should create README file and add the badge if it did not exist', () => {
    addBadgeToReadme(tree, badge, link, description);

    expectHasBadge(tree);
  });

  it('should ignore adding the badge if already present', () => {
    tree.write(readmeFile, `# README\n[![description](badge)](link)`);

    addBadgeToReadme(tree, badge, link, description);

    expect(console.log).toHaveBeenCalledWith(`Badge for description already present in ${readmeFile}`);
  });

  it('should add the badge after the main title if there were not any before', () => {
    const readme = `\nSome content\n# README`;
    tree.write(readmeFile, readme);

    addBadgeToReadme(tree, badge, link, description);

    expect(tree.read(readmeFile)?.toString()).toBe(`${readme}\n\n[![description](badge)](link)`);
  });

  it('should add the badge to the end of an existing line of badges', () => {
    const readme = `# README\n\n[![existing](existing)](existing)`;
    tree.write(readmeFile, readme);

    addBadgeToReadme(tree, badge, link, description);

    expect(tree.read(readmeFile)?.toString()).toBe(
      `# README\n\n[![existing](existing)](existing) [![description](badge)](link)`
    );
  });

  it('should add the badge to the beginning of an existing line of badges', () => {
    const readme = `# README\n\n[![existing](existing)](existing)`;
    tree.write(readmeFile, readme);

    addBadgeToReadme(tree, badge, link, description, true);

    expect(tree.read(readmeFile)?.toString()).toBe(
      `# README\n\n[![description](badge)](link) [![existing](existing)](existing)`
    );
  });

  it('should create a badge without link', () => {
    const readme = `# README\n\n[![existing](existing)](existing)`;
    tree.write(readmeFile, readme);

    addBadgeToReadme(tree, badge, null, description);

    expect(tree.read(readmeFile)?.toString()).toBe(
      `# README\n\n[![existing](existing)](existing) ![description](badge)`
    );
  });
});
