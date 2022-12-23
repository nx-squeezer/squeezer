import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { getNpmPackageVersion } from '../npm';
import { addDependencyToPackageJson } from './add-dependency-to-package-json';
import { readPackageJson } from './package-json';

jest.mock('../npm');

describe('@nx-squeezer/workspace addDependencyToPackageJson', () => {
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
