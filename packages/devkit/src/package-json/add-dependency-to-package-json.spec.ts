import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { addDependencyToPackageJson } from './add-dependency-to-package-json';
import { readPackageJson } from './package-json';
import { getNpmPackageVersion } from '../npm';

jest.mock('../npm');

describe('@nx-squeezer/devkit addDependencyToPackageJson', () => {
  let tree: Tree;
  const packageName = 'package';
  const version = '1.0.0';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
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
