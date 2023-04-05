import { dirname } from 'path';

import { tmpProjPath } from '@nrwl/nx-plugin/testing';

import { exec } from '../exec';

// https://github.com/nrwl/nx/blob/master/packages/nx-plugin/src/utils/testing-utils/nx-project.ts
export function runNxNewCommand(args?: string): void {
  const localTmpDir = dirname(tmpProjPath());
  const arrayArgs = args ? [args] : [];

  exec(
    'node',
    [
      require.resolve('nx'),
      'new',
      'proj',
      `--nx-workspace-root=${localTmpDir}`,
      '--no-interactive',
      '--skip-install',
      '--collection=@nrwl/workspace',
      '--npmScope=proj',
      '--preset=empty',
      ...arrayArgs,
    ],
    { cwd: localTmpDir }
  );
}
