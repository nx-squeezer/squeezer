import { Tree } from '@nrwl/devkit';
import { createTree } from '@nrwl/devkit/testing';
import { parse, stringify } from 'yaml';

import { addGitHubCiJobStep, ciFile, existsGitHubCiWorkflow, GitHubActionJobStep } from './github-workflow';

describe('@nx-squeezer/workspace additHubCiJobStep', () => {
  let tree: Tree;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    tree = createTree();
  });

  it('should detect if the CI file exists', () => {
    expect(existsGitHubCiWorkflow(tree)).toBeFalsy();

    tree.write(ciFile, '');

    expect(existsGitHubCiWorkflow(tree)).toBeTruthy();
  });

  it('should detect if step cannot be added', () => {
    addGitHubCiJobStep(tree, 'job', { name: 'step' });

    expect(console.error).toHaveBeenCalledWith(`Could not find "job" job in file: ${ciFile}`);
  });

  it('should detect if job already existing', () => {
    createCiFile([{ name: 'step' }]);

    addGitHubCiJobStep(tree, 'test', { name: 'step' });

    expect(console.error).toHaveBeenCalledWith(`Step "step" in "test" already present in file: ${ciFile}`);
  });

  it('should add a new job', () => {
    createCiFile([{ name: 'step' }]);

    addGitHubCiJobStep(tree, 'test', { name: 'new-step' });

    expect(parse(tree.read(ciFile)?.toString() ?? '')).toStrictEqual({
      jobs: { test: { steps: [{ name: 'step' }, { name: 'new-step' }] } },
    });
  });

  function createCiFile(steps: GitHubActionJobStep[] = []) {
    tree.write(ciFile, stringify({ jobs: { test: { steps } } }));
  }
});
