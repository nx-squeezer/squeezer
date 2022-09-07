import { execSync } from 'child_process';

export function getNpmPackageVersion(packageName: string): string | null {
  try {
    const version = execSync(`npm view ${packageName} version`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    if (version) {
      return version
        .toString()
        .trim()
        .replace(/^\n*|\n*$/g, '');
    }
  } catch (err) {
    return null;
  }
  return null;
}
