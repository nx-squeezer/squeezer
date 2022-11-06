import { execSync } from 'child_process';

import { getNpmPackageVersion } from './get-npm-package-version';

jest.mock('child_process');

describe('@nx-squeezer/workspace getNpmPackageVersion', () => {
  const packageName = 'package';
  const version = '1.0.0';

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute npm command and return package version', () => {
    (execSync as jest.Mock).mockReturnValue(version);

    expect(getNpmPackageVersion(packageName)).toBe(version);
    expect(execSync).toHaveBeenCalledWith(`npm view ${packageName} version`, { stdio: ['pipe', 'pipe', 'ignore'] });
  });

  it('should not fail if exec sync fails', () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error();
    });

    expect(getNpmPackageVersion(packageName)).toBeNull();
    expect(console.error).toHaveBeenCalledWith(`Could not retrieve package version for "${packageName}"`);
  });

  it('should not fail if exec sync returns empty', () => {
    (execSync as jest.Mock).mockReturnValue(null);

    expect(getNpmPackageVersion(packageName)).toBeNull();
    expect(console.error).toHaveBeenCalledWith(`Could not retrieve package version for "${packageName}"`);
  });
});
