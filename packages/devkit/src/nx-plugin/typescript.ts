/* istanbul ignore file */

import { existsSync } from 'fs';
import { dirname } from 'path';

import { getRootTsConfigPath } from 'nx/src/utils/typescript';
import { ParsedCommandLine } from 'typescript';

/**
 * TypeScript configuration.
 */
let tsConfig: ParsedCommandLine;

/**
 * TypeScript path mappings.
 */
let tsPathMappings: ParsedCommandLine['options']['paths'];

/**
 * https://github.com/nrwl/nx/blob/master/packages/devkit/src/utils/module-federation/typescript.ts
 *
 * @ignore
 */
export function readTsPathMappings(
  tsConfigPath: string = process.env.NX_TSCONFIG_PATH ?? getRootTsConfigPath() ?? ''
): ParsedCommandLine['options']['paths'] {
  if (tsPathMappings) {
    return tsPathMappings;
  }

  tsConfig ??= readTsConfiguration(tsConfigPath);
  tsPathMappings = {};
  Object.entries(tsConfig.options?.paths ?? {}).forEach(([alias, paths]) => {
    if (tsPathMappings) {
      tsPathMappings[alias] = paths.map((path) => path.replace(/^\.\//, ''));
    }
  });

  return tsPathMappings;
}

/**
 * Reads the TypeScript configuration safely.
 */
function readTsConfiguration(tsConfigPath: string): ParsedCommandLine {
  if (!existsSync(tsConfigPath)) {
    throw new Error(`NX MF: TsConfig Path for workspace libraries does not exist! (${tsConfigPath}).`);
  }

  return readTsConfig(tsConfigPath);
}

/**
 * TypeScript module.
 */
let tsModule: typeof import('typescript');

/**
 * Reads the TypeScript configuration.
 */
export function readTsConfig(tsConfigPath: string): ParsedCommandLine {
  if (!tsModule) {
    tsModule = require('typescript');
  }
  const readResult = tsModule.readConfigFile(tsConfigPath, tsModule.sys.readFile);
  return tsModule.parseJsonConfigFileContent(readResult.config, tsModule.sys, dirname(tsConfigPath));
}
