import { execFileSync } from 'child_process';
import { basename } from 'path';

import { sync as whichSync } from 'which';

import { joinNormalize } from '../path';

/**
 * Result of running a cli command.
 */
export interface ExecResult {
  /**
   * Output.
   */
  output: string;

  /**
   * Error if raised.
   */
  error?: Error;
}

/**
 *Options to run a cli command.
 */
export interface ExecOptions {
  /**
   * Working directory for the command that is executed.
   */
  cwd?: string | string[];
}

/**
 * Run an executable file with given arguments.
 */
export function exec(file: string, args: ReadonlyArray<string>, options?: ExecOptions): ExecResult {
  let normalizedCwd: string | undefined;
  if (options?.cwd != null) {
    normalizedCwd = joinNormalize(...(Array.isArray(options.cwd) ? options.cwd : [options.cwd]));
  }

  const resolvedFile = basename(whichSync(file));

  try {
    const result = execFileSync(resolvedFile, args, { cwd: normalizedCwd, shell: true });
    return { output: result.toString() };
  } catch (error) {
    console.error(error);
    return { output: '', error: error instanceof Error ? error : new Error(error as string) };
  }
}
