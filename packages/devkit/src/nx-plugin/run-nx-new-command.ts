import { dirname } from 'path';

import { tmpProjPath } from '@nx/plugin/testing';

import { exec } from '../exec';

// https://github.com/nrwl/nx/blob/master/packages/nx-plugin/src/utils/testing-utils/nx-project.ts
export function runNxNewCommand(): void {
  const localTmpDir = dirname(tmpProjPath());

  exec(
    'node',
    [
      require.resolve('nx'),
      'new',
      'proj',
      `--nx-workspace-root=${localTmpDir}`,
      '--no-interactive',
      '--skip-install',
      '--collection=@nx/workspace',
      '--npmScope=proj',
      '--preset=apps',
    ],
    { cwd: localTmpDir }
  );
}
