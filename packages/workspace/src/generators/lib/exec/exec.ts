import { execFileSync } from 'child_process';
import { basename } from 'path';

import { sync as whichSync } from 'which';

import { joinNormalize } from '../path';

export interface ExecResult {
  output: string;
  error?: Error;
}

export interface ExecOptions {
  cwd?: string | string[];
}

export function exec(file: string, args: ReadonlyArray<string>, options?: ExecOptions): ExecResult {
  let normalizedCwd: string | undefined;
  if (options?.cwd != null) {
    normalizedCwd = joinNormalize(...(Array.isArray(options.cwd) ? options.cwd : [options.cwd]));
  }

  const resolvedFile = basename(whichSync(file));

  try {
    const result = execFileSync(resolvedFile, args, { cwd: normalizedCwd });
    return { output: result.toString() };
  } catch (error) {
    console.error(error);
    return { output: '', error: new Error(error as string) };
  }
}
