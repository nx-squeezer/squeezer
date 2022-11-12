export const lintStaged = 'lint-staged';
export const lintStagedConfigPath = '.lintstagedrc.json';

export type LintStagedConfig = Record<string, string | string[]>;

export const lintStagedDefaultConfig: LintStagedConfig = {
  '*.{json,scss,yml,html,md}': ['prettier --write'],
  '*.{js,ts,html}': ['eslint --fix'],
};
