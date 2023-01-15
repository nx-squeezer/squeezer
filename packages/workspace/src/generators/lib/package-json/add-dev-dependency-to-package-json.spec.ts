import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addDevDependencyToPackageJson } from './add-dev-dependency-to-package-json';
import { readPackageJson } from './package-json';
import { getNpmPackageVersion } from '../npm';

jest.mock('../npm');

describe('@nx-squeezer/workspace addDevDependencyToPackageJson', () => {
  let tree: Tree;
  const packageName = 'package';
  const version = '1.0.0';

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  it('should add the dependency to package.json', () => {
    (getNpmPackageVersion as jest.Mock).mockReturnValue(version);
    addDevDependencyToPackageJson(tree, packageName);

    expect(getNpmPackageVersion).toHaveBeenCalledWith(packageName);
    expect(readPackageJson(tree).devDependencies?.[packageName]).toBe(version);
  });

  it('should add the dependency to package.json and use latest version if can not be resolved', () => {
    (getNpmPackageVersion as jest.Mock).mockReturnValue(null);
    addDevDependencyToPackageJson(tree, packageName);

    expect(getNpmPackageVersion).toHaveBeenCalledWith(packageName);
    expect(readPackageJson(tree).devDependencies?.[packageName]).toBe('latest');
  });
});
