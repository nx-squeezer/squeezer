/**
 * Path of Renovate CI workflow.
 */
export const renovateCiFile = './.github/workflows/renovate.yml';

/**
 * Path of Renovate configuration.
 */
export const renovateConfigFile = '.github/renovate-config.js';

/**
 * Path of Renovate presents.
 */
export const renovateFile = '.github/renovate.json';

/**
 * Path of util script to generate migrations.
 */
export const renovateCreateMigrationsFile = 'nx-create-migrations.sh';

/**
 * List of renovate presets.
 */
export const renovatePresets = [
  'angularWorkspace.json',
  'tooling.json',
  'default.json',
  'githubActions.json',
  'gitmoji.json',
  'groupAllNonMajor.json',
  'maintenance.json',
  'npm.json',
  'nxMonorepo.json',
  'widenRangeLibraryDeps.json',
];

/**
 * Git branch for Renovate PRs.
 */
export const renovateBranch = 'renovate-github/**';
