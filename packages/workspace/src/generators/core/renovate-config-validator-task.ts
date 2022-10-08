import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';

import { joinNormalize } from './join-normalize';

export function renovateConfigValidatorTask(tree: Tree): boolean {
  try {
    console.log(`Validating Renovate configuration...`);

    const output: Buffer | null = execSync(`npx renovate-config-validator`, {
      cwd: joinNormalize(tree.root),
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    if (output) {
      const strOutput = output.toString();
      console.log(strOutput);
      return strOutput.includes(`Config validated successfully`);
    }
  } catch (err) {
    console.error(err);
  }

  return false;
}
