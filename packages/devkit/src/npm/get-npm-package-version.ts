import { exec } from '../exec';

/**
 * Returns the latest version of a given npm package.
 */
export function getNpmPackageVersion(packageName: string): string | null {
  const { output, error } = exec('npm', ['view', packageName, 'version']);

  if (error != null) {
    console.error(`Could not retrieve package version for "${packageName}"`);
    return null;
  }

  return output.trim().replace(/^\n*$/g, '');
}
