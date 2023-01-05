import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';

import { exec } from '../lib';
import { renovateConfigValidatorTask } from './renovate-config-validator-task';

jest.mock('../lib');

describe('@nx-squeezer/workspace renovateConfigValidatorTask', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTree();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  it('should execute renovate config validator command', () => {
    (exec as jest.Mock).mockReturnValue({ output: '' });

    expect(renovateConfigValidatorTask(tree)).toBeFalsy();

    expect(exec).toHaveBeenCalledWith('npx', ['--package', 'renovate', '-c', 'renovate-config-validator'], {
      cwd: '/virtual',
    });
  });

  it('should return false', () => {
    (exec as jest.Mock).mockReturnValue({ error: new Error(`Custom error`) });

    expect(renovateConfigValidatorTask(tree)).toBeFalsy();
  });

  it('should return true if the validator runs successfully', () => {
    (exec as jest.Mock).mockReturnValue({ output: `INFO: Config validated successfully` });

    expect(renovateConfigValidatorTask(tree)).toBeTruthy();
  });

  it('should return fals if the validator runs fails', () => {
    (exec as jest.Mock).mockReturnValue({ output: `FATAL: Error` });

    expect(renovateConfigValidatorTask(tree)).toBeFalsy();
  });
});
