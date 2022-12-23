import { Tree } from '@nrwl/devkit';

import { exec } from '../lib';

export function renovateConfigValidatorTask(tree: Tree): boolean {
  console.log(`Validating Renovate configuration...`);
  const { output, error } = exec('npx', ['renovate-config-validator'], {
    cwd: tree.root,
  });

  if (error != null) {
    return false;
  }

  return output.includes(`Config validated successfully`);
}
