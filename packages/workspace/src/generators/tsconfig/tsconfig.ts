import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

export const tsConfigFile = 'tsconfig.base.json';

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
