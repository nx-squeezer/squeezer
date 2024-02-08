import { SchemaForPrettierrc } from '@schemastore/prettierrc';

/**
 * Prettier default configuration.
 */
export const prettierDefaultConfig: Exclude<SchemaForPrettierrc, string> = {
  printWidth: 120,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'html',
      },
    },
  ],
};
