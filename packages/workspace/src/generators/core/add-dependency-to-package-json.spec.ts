import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addDependencyToPackageJson } from './add-dependency-to-package-json';
import { getNpmPackageVersion } from './get-npm-package-version';
import { readPackageJson } from './package-json';

jest.mock('./get-npm-package-version');

describe('@nx-squeezer/workspace addDependencyToPackageJson', () => {
  let tree: Tree;
  const packageName = 'package';
  const version = '1.0.0';

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add the dependency to package.json', () => {
    (getNpmPackageVersion as jest.Mock).mockReturnValue(version);
    addDependencyToPackageJson(tree, packageName);

    expect(getNpmPackageVersion).toHaveBeenCalledWith(packageName);
    expect(readPackageJson(tree).dependencies?.[packageName]).toBe(version);
  });

  it('should add the dependency to package.json and use latest version if can not be resolved', () => {
    (getNpmPackageVersion as jest.Mock).mockReturnValue(null);
    addDependencyToPackageJson(tree, packageName);

    expect(getNpmPackageVersion).toHaveBeenCalledWith(packageName);
    expect(readPackageJson(tree).dependencies?.[packageName]).toBe('latest');
  });
});
