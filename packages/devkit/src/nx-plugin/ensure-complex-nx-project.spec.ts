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

  beforeEach(() => {
    (readFileSync as jest.Mock).mockReturnValue(`{ "devDependencies": {} }`);
    (writeFileSync as jest.Mock).mockReturnValue(null);
    (ensureDirSync as jest.Mock).mockReturnValue(null);

    (cleanup as jest.Mock).mockReturnValue(null);
    (tmpProjPath as jest.Mock).mockImplementation((path) => `${testPath}/${path ?? ''}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute commands', () => {
    ensureComplexNxProject([packageA, `dist/${packageA}`]);

    expect(ensureDirSync).toHaveBeenCalledWith(`${testPath}/`);
    expect(cleanup).toHaveBeenCalled();
    expect(runNxNewCommand).toHaveBeenCalled();
    expect(runPackageManagerInstall).toHaveBeenCalled();
  });

  it('should update dev dependencies in temp project folder', () => {
    ensureComplexNxProject([packageA, `dist/${packageA}`]);

    expect(writeFileSync).toHaveBeenCalledWith(
      `test/${packageJsonFile}`,
      JSON.stringify({ devDependencies: { [packageA]: `file:root/dist/${packageA}` } }, null, 2)
    );
  });

  it('should not update dist folder if dependencies not present', () => {
    (readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === `root/dist/${packageA}/${packageJsonFile}`) {
        return `{ "dependencies": {} }`;
      } else {
        return `{ "devDependencies": {} }`;
      }
    });

    ensureComplexNxProject([packageA, `dist/${packageA}`]);

    expect(runPackageManagerInstall).not.toHaveBeenCalledWith(`root/dist/${packageA}`);
  });

  it('should not update dist folder if dependencies are empty', () => {
    (readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === `root/dist/${packageA}/${packageJsonFile}`) {
        return `{}`;
      } else {
        return `{ "devDependencies": {} }`;
      }
    });

    ensureComplexNxProject([packageA, `dist/${packageA}`]);

    expect(runPackageManagerInstall).not.toHaveBeenCalledWith(`root/dist/${packageA}`);
  });

  it('should update dist folder with file dependencies', () => {
    (readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === `root/dist/${packageA}/${packageJsonFile}`) {
        return `{ "dependencies": { "${packageA}": "0.0.0" } }`;
      } else {
        return `{ "devDependencies": {} }`;
      }
    });

    ensureComplexNxProject([packageA, `dist/${packageA}`]);

    expect(writeFileSync).toHaveBeenCalledWith(
      `root/dist/${packageA}/${packageJsonFile}`,
      JSON.stringify({ dependencies: { [packageA]: `file:root/dist/${packageA}` } }, null, 2)
    );
    expect(runPackageManagerInstall).toHaveBeenCalledWith(`root/dist/${packageA}`);
  });

  it('should update dist folder with file peer dependencies', () => {
    (readFileSync as jest.Mock).mockImplementation((path) => {
      if (path === `root/dist/${packageA}/${packageJsonFile}`) {
        return `{ "peerDependencies": { "${packageA}": "0.0.0" } }`;
      } else {
        return `{ "devDependencies": {} }`;
      }
    });

    ensureComplexNxProject([packageA, `dist/${packageA}`]);

    expect(writeFileSync).toHaveBeenCalledWith(
      `root/dist/${packageA}/${packageJsonFile}`,
      JSON.stringify({ peerDependencies: { [packageA]: `file:root/dist/${packageA}` } }, null, 2)
    );
    expect(runPackageManagerInstall).toHaveBeenCalledWith(`root/dist/${packageA}`);
  });
});
