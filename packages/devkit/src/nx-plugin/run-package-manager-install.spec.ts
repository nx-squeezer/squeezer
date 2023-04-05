import { execSync } from 'child_process';

import { getPackageManagerCommand } from '@nrwl/devkit';
import { tmpProjPath } from '@nrwl/nx-plugin/testing';

import { runPackageManagerInstall } from './run-package-manager-install';

jest.mock('@nrwl/devkit');
jest.mock('@nrwl/nx-plugin/testing');
jest.mock('child_process');

describe('@nx-squeezer/devkit runPackageManagerInstall', () => {
  const installCommand = 'npm install';
  const projPath = 'proj';

  beforeEach(() => {
    (getPackageManagerCommand as jest.Mock).mockReturnValue({ install: installCommand });
    (tmpProjPath as jest.Mock).mockReturnValue(projPath);
    (execSync as jest.Mock).mockReturnValue('success');
  });

  it('should execute install command for a given path', () => {
    runPackageManagerInstall('path');
    expect(execSync).toHaveBeenCalledWith(installCommand, {
      cwd: 'path',
      stdio: ['ignore', 'ignore', 'ignore'],
    });
  });

  it('should execute install command for the project path as default', () => {
    runPackageManagerInstall();
    expect(execSync).toHaveBeenCalledWith(installCommand, {
      cwd: projPath,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
  });
});
