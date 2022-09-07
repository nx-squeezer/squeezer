import { SchemaForPrettierrc } from '@schemastore/prettierrc';

export const prettierDefaultConfig: Exclude<SchemaForPrettierrc, string> = {
  printWidth: 140,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  jsxBracketSameLine: true,
  arrowParens: 'always',
};
