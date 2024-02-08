/**
 * Lint-staged NPM package name.
 */
export const lintStaged = 'lint-staged';

/**
 * Filename of lint-staged configuration file.
 */
export const lintStagedConfigPath = '.lintstagedrc.json';

/**
 * Lint-staged configuration.
 */
export type LintStagedConfig = Record<string, string | string[]>;

/**
 * Lint-staged default configuration.
 */
export const lintStagedDefaultConfig: LintStagedConfig = {
  '*.{json,scss,yml,html,md}': ['prettier --write'],
  '*.{js,ts,html}': ['eslint --fix'],
};
