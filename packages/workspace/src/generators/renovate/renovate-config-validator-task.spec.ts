import { execSync } from 'child_process';

import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { renovateConfigValidatorTask } from './renovate-config-validator-task';

jest.mock('child_process');

describe('@nx-squeezer/workspace renovateConfigValidatorTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute renovate config validator command', () => {
    (execSync as jest.Mock).mockReturnValue(null);

    expect(renovateConfigValidatorTask(tree)).toBeFalsy();

    expect(execSync).toHaveBeenCalledWith('npx renovate-config-validator', {
      cwd: '/virtual',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  });

  it('should return false and log the error if it fails', () => {
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error(`Custom error`);
    });

    expect(renovateConfigValidatorTask(tree)).toBeFalsy();

    expect(console.error).toHaveBeenCalledWith(new Error(`Custom error`));
  });

  it('should return true if the validator runs successfully', () => {
    (execSync as jest.Mock).mockReturnValue(`INFO: Config validated successfully`);

    expect(renovateConfigValidatorTask(tree)).toBeTruthy();
  });

  it('should return fals if the validator runs fails', () => {
    (execSync as jest.Mock).mockReturnValue(`FATAL: Error`);

    expect(renovateConfigValidatorTask(tree)).toBeFalsy();
  });
});
