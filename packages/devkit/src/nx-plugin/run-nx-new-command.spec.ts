import { dirname } from 'path';

import { tmpProjPath } from '@nrwl/nx-plugin/testing';

import { runNxNewCommand } from './run-nx-new-command';
import { exec } from '../exec';

jest.mock('path');
jest.mock('@nrwl/nx-plugin/testing');
jest.mock('../exec');

describe('@nx-squeezer/devkit runNxNewCommand', () => {
  const testPath = 'test';

  beforeEach(() => {
    (dirname as jest.Mock).mockReturnValue('dir');
    (tmpProjPath as jest.Mock).mockReturnValue(testPath);
    (exec as jest.Mock).mockImplementation(() => void {});
  });

  it('should execute command', () => {
    runNxNewCommand();
    expect(dirname).toHaveBeenCalledWith(testPath);
  });
});
