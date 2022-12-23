export const commitlintCli = '@commitlint/cli';
export const commitlintConfigConventional = '@commitlint/config-conventional';
export const commitlintConfigPath = '.commitlintrc.json';

export interface CommitlintConfig {
  extends: string[];
  rules: Record<string, (string | number)[]>;
}

export const commitlintDefaultConfig: CommitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0, 'always'],
  },
};
