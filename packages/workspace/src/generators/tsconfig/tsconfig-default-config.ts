import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile } from '@schemastore/tsconfig';

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
