import { readFileSync, writeFileSync } from 'fs';

import { cleanup, tmpProjPath } from '@nrwl/nx-plugin/testing';
import { ensureDirSync } from 'fs-extra';

import { ensureComplexNxProject } from './ensure-complex-nx-project';
import { runNxNewCommand } from './run-nx-new-command';
import { runPackageManagerInstall } from './run-package-manager-install';
import { packageJsonFile } from '../package-json';

jest.mock('fs');
jest.mock('fs-extra');
jest.mock('@nrwl/nx-plugin/testing');

jest.mock('@nrwl/devkit', () => ({
  ...jest.requireActual('@nrwl/devkit'),
  workspaceRoot: 'root',
}));

jest.mock('./run-nx-new-command');
jest.mock('./run-package-manager-install');

describe('@nx-squeezer/devkit ensureComplexNxProject', () => {
  const testPath = 'test';
  const packageA = 'packageA';
  const fileRootPackageA = `file:root/dist/${packageA}`;
  const rootDistPackageA = `root/dist/${packageA}`;
  const distPackageA = `dist/${packageA}`;
  const emptyDependencies = `{ "dependencies": {} }`;
  const emptyDevDependencies = `{ "devDependencies": {} }`;

  beforeEach(() => {
    (readFileSync as jest.Mock).mockReturnValue(emptyDevDependencies);
    (writeFileSync as jest.Mock).mockReturnValue(null);
    (ensureDirSync as jest.Mock).mockReturnValue(null);

    (cleanup as jest.Mock).mockReturnValue(null);
    (tmpProjPath as jest.Mock).mockImplementation((path) => `${testPath}/${path ?? ''}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute commands', () => {
    ensureComplexNxProject([packageA, distPackageA]);

    expect(ensureDirSync).toHaveBeenCalledWith(`${testPath}/`);
    expect(cleanup).toHaveBeenCalled();
    expect(runNxNewCommand).toHaveBeenCalled();
    expect(runPackageManagerInstall).toHaveBeenCalled();
  });

  it('should update dev dependencies in temp project folder', () => {
    ensureComplexNxProject([packageA, distPackageA]);

    expect(writeFileSync).toHaveBeenCalledWith(
      `test/${packageJsonFile}`,
      JSON.stringify({ devDependencies: { [packageA]: fileRootPackageA } }, null, 2)
    );
  });

  it('should not update dist folder if dependencies not present', () => {
    (readFileSync as jest.Mock).mockImplementation((path) =>
      path === `root/dist/${packageA}/${packageJsonFile}` ? emptyDependencies : emptyDevDependencies
    );

    ensureComplexNxProject([packageA, distPackageA]);

    expect(runPackageManagerInstall).not.toHaveBeenCalledWith(rootDistPackageA);
  });

  it('should not update dist folder if dependencies are empty', () => {
    (readFileSync as jest.Mock).mockImplementation((path) =>
      path === `root/dist/${packageA}/${packageJsonFile}` ? `{}` : emptyDevDependencies
    );

    ensureComplexNxProject([packageA, distPackageA]);

    expect(runPackageManagerInstall).not.toHaveBeenCalledWith(rootDistPackageA);
  });

  it('should update dist folder with file dependencies', () => {
    (readFileSync as jest.Mock).mockImplementation((path) =>
      path === `root/dist/${packageA}/${packageJsonFile}`
        ? `{ "dependencies": { "${packageA}": "0.0.0" } }`
        : emptyDevDependencies
    );

    ensureComplexNxProject([packageA, distPackageA]);

    expect(writeFileSync).toHaveBeenCalledWith(
      `root/dist/${packageA}/${packageJsonFile}`,
      JSON.stringify({ dependencies: { [packageA]: fileRootPackageA } }, null, 2)
    );
    expect(runPackageManagerInstall).toHaveBeenCalledWith(rootDistPackageA);
  });

  it('should update dist folder with file peer dependencies', () => {
    (readFileSync as jest.Mock).mockImplementation((path) =>
      path === `root/dist/${packageA}/${packageJsonFile}`
        ? `{ "peerDependencies": { "${packageA}": "0.0.0" } }`
        : emptyDevDependencies
    );

    ensureComplexNxProject([packageA, distPackageA]);

    expect(writeFileSync).toHaveBeenCalledWith(
      `root/dist/${packageA}/${packageJsonFile}`,
      JSON.stringify({ peerDependencies: { [packageA]: fileRootPackageA } }, null, 2)
    );
    expect(runPackageManagerInstall).toHaveBeenCalledWith(rootDistPackageA);
  });
});
