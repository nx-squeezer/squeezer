import { execSync } from 'child_process';
import { dirname } from 'path';

import { tmpProjPath } from '@nrwl/nx-plugin/testing';

// https://github.com/nrwl/nx/blob/master/packages/nx-plugin/src/utils/testing-utils/nx-project.ts
export function runNxNewCommand(args?: string, silent?: boolean) {
  const localTmpDir = dirname(tmpProjPath());
  return execSync(
    `node ${require.resolve(
      'nx'
    )} new proj --nx-workspace-root=${localTmpDir} --no-interactive --skip-install --collection=@nrwl/workspace --npmScope=proj --preset=empty ${
      args || ''
    }`,
    {
      cwd: localTmpDir,
      // eslint-disable-next-line no-constant-condition, sonarjs/no-redundant-boolean
      ...(silent && false ? { stdio: ['ignore', 'ignore', 'ignore'] } : {}),
    }
  );
}
