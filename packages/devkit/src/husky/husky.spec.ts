import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { addHuskyHookTask, addHuskyToPackageJson, husky, HuskyHooks, huskyPath, installHuskyTask } from './husky';
import { exec } from '../exec';
import { addDevDependencyToPackageJson, addScriptToPackageJson } from '../package-json';
import { joinNormalize } from '../path';

jest.mock('../exec');
jest.mock('../package-json');

describe('@nx-squeezer/devkit husky', () => {
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

      expect(exec).toHaveBeenCalledWith(`npx`, ['husky', 'init'], { cwd: '/virtual' });
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

    it('should fail if husky not installed', () => {
      addHuskyHookTask(tree, hook, command);

      expect(console.error).toHaveBeenCalledWith(`Husky hook does not exist in path: /virtual`);
    });

    it('should fail if husky installed but hook does not exist', () => {
      tree.write(joinNormalize(huskyPath, 'commit'), '');

      addHuskyHookTask(tree, hook, command);

      expect(console.error).toHaveBeenCalledWith(`Husky hook does not exist in path: /virtual`);
    });

    it('should add husky hook if husky installed, hook exists and command is not defined', () => {
      const hookPath = joinNormalize(huskyPath, hook);
      tree.write(hookPath, '');

      addHuskyHookTask(tree, hook, command);

      expect(tree.read(hookPath)?.toString()).toContain(command);
    });

    it('should skip adding the hook if already exists', () => {
      const hookPath = joinNormalize(huskyPath, hook);
      tree.write(hookPath, command);

      addHuskyHookTask(tree, hook, command);

      expect(console.log).toHaveBeenCalledWith(`Command "${command}" already added to ${hook} husky hook.`);
    });
  });
});
