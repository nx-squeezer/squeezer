import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

/**
 * Filename of tsconfig base file.
 */
export const tsConfigFile = 'tsconfig.base.json';

/**
 * Default configuration for tsconfig.
 */
export const tsConfigDefault: JSONSchemaForTheTypeScriptCompilerSConfigurationFile = {
  compilerOptions: {
    forceConsistentCasingInFileNames: true,
    noImplicitAny: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noFallthroughCasesInSwitch: true,
    strict: true,
  },
};
