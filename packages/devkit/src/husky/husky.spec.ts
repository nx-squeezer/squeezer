import { Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import { addHuskyHookTask, addHuskyToPackageJson, husky, HuskyHooks, huskyPath, installHuskyTask } from './husky';
import { exec } from '../exec';
import { addDevDependencyToPackageJson, addScriptToPackageJson } from '../package-json';
import { joinNormalize } from '../path';

jest.mock('../exec');
jest.mock('../package-json');

describe('@nx-squeezer/workspace husky', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    (addDevDependencyToPackageJson as jest.Mock).mockImplementation(() => void {});
    (addScriptToPackageJson as jest.Mock).mockImplementation(() => void {});
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
  });

  describe('addHuskyToPackageJson', () => {
    it('should add dependency and script to package.json', () => {
      addHuskyToPackageJson(tree);

      expect(addDevDependencyToPackageJson).toHaveBeenCalledWith(tree, husky);
      expect(addScriptToPackageJson).toHaveBeenCalledWith(tree, 'prepare', 'husky install');
    });
  });

  describe('installHuskyTask', () => {
    it('should install husky', () => {
      (exec as jest.Mock).mockReturnValue({ output: '' });

      installHuskyTask(tree);

      expect(exec).toHaveBeenCalledWith(`npx`, ['husky', 'install'], { cwd: '/virtual' });
    });

    it('should skip installation if already installed', () => {
      (exec as jest.Mock).mockReturnValue({ output: '' });
      tree.write(joinNormalize(huskyPath, 'pre-commit'), '');

      installHuskyTask(tree);

      expect(console.log).toHaveBeenCalledWith(`Husky already installed, skipping installation.`);
    });

    it('should not fail if exec sync fails', () => {
      (exec as jest.Mock).mockReturnValue({ error: '' });

      installHuskyTask(tree);

      expect(console.error).toHaveBeenCalledWith(`Could not install husky in path: /virtual`);
    });
  });

  describe('addHuskyHookTask', () => {
    const hook: HuskyHooks = 'pre-commit';
    const command = 'npm run test';

    it('should add husky hook if husky not installed', () => {
      addHuskyHookTask(tree, hook, command);

      expect(exec).toHaveBeenCalledWith(`npx`, ['husky', 'add', `${huskyPath}/${hook}`, command], {
        cwd: '/virtual',
      });
    });

    it('should add husky hook if husky installed but hook does not exist', () => {
      tree.write(joinNormalize(huskyPath, 'commit'), '');

      addHuskyHookTask(tree, hook, command);

      expect(exec).toHaveBeenCalledWith(`npx`, ['husky', 'add', `${huskyPath}/${hook}`, command], {
        cwd: '/virtual',
      });
    });

    it('should add husky hook if husky installed, hook exists but command is not defined', () => {
      tree.write(joinNormalize(huskyPath, hook), '');

      addHuskyHookTask(tree, hook, command);

      expect(exec).toHaveBeenCalledWith(`npx`, ['husky', 'add', `${huskyPath}/${hook}`, command], {
        cwd: '/virtual',
      });
    });

    it('should skip adding the hook if already exists', () => {
      tree.write(joinNormalize(huskyPath, hook), command);

      addHuskyHookTask(tree, hook, command);

      expect(console.log).toHaveBeenCalledWith(`Command "${command}" already added to ${hook} husky hook.`);
    });

    it('should not fail if exec sync fails', () => {
      (exec as jest.Mock).mockReturnValue({ error: '' });

      addHuskyHookTask(tree, hook, command);

      expect(console.error).toHaveBeenCalledWith(`Could not add husky hook in path: /virtual`);
    });
  });
});
