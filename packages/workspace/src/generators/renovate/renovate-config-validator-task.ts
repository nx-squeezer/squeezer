import { Tree } from '@nrwl/devkit';

import { exec } from '../lib';

export function renovateConfigValidatorTask(tree: Tree): boolean {
  console.log(`Validating Renovate configuration...`);
  const { output, error } = exec('npx', ['--package', 'renovate', '-c', 'renovate-config-validator'], {
    cwd: tree.root,
  });

  if (error != null) {
    console.error(error);
    return false;
  }

  console.log(output);

  return output.includes(`Config validated successfully`);
}
