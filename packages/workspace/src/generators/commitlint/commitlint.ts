/**
 * Commitlint CLI NPM package.
 */
export const commitlintCli = '@commitlint/cli';

/**
 * Commitlint conventional config NPM package.
 */
export const commitlintConfigConventional = '@commitlint/config-conventional';

/**
 * Filename of commitlint configuration.
 */
export const commitlintConfigPath = '.commitlintrc.json';

/**
 * Commitlint configuration.
 */
export interface CommitlintConfig {
  /**
   * Configurations to extend.
   */
  extends: string[];

  /**
   * Rules.
   */
  rules: Record<string, (string | number)[]>;
}

/**
 * Commitlint default configuration.
 */
export const commitlintDefaultConfig: CommitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0, 'always'],
  },
};
