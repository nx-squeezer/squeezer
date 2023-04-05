import { getNpmPackageVersion } from './get-npm-package-version';
import { exec } from '../exec';

jest.mock('../exec');

describe('@nx-squeezer/devkit getNpmPackageVersion', () => {
  const packageName = 'package';
  const version = '1.0.0';

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute npm command and return package version', () => {
    (exec as jest.Mock).mockReturnValue({ output: version });

    expect(getNpmPackageVersion(packageName)).toBe(version);
    expect(exec).toHaveBeenCalledWith(`npm`, ['view', packageName, 'version']);
  });

  it('should not fail if exec sync fails', () => {
    (exec as jest.Mock).mockReturnValue({ error: '' });

    expect(getNpmPackageVersion(packageName)).toBeNull();
    expect(console.error).toHaveBeenCalledWith(`Could not retrieve package version for "${packageName}"`);
  });
});
