import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';
import { JSONSchemaForNPMPackageJsonFiles } from '@schemastore/package';

import { readPackageJson, writePackageJson } from './package-json';

describe('@nx-squeezer/devkit packageJsonFile', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
  });

  it('should create and read package.json file', () => {
    const packageJson: JSONSchemaForNPMPackageJsonFiles = { name: 'name', version: '1.0.0' };

    writePackageJson(tree, packageJson);

    expect(readPackageJson(tree)).toStrictEqual(packageJson);
  });
});
