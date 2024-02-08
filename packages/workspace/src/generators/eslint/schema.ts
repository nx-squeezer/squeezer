/**
 * Schema for ESLint generator.
 */
export interface EsLintGeneratorSchema {
  /**
   * Applies eslint:recommended.
   */
  eslintRecommended?: boolean;

  /**
   * Applies sonarjs:recommended.
   */
  sonarJs?: boolean;

  /**
   * Applies unused-imports.
   */
  unusedImports?: boolean;

  /**
   * Applies @typescript-eslint/recommended.
   */
  typescriptRecommended?: boolean;

  /**
   * Applies deprecation.
   */
  deprecation?: boolean;

  /**
   * Applies import.
   */
  importOrder?: boolean;
}
