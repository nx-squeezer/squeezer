import { addProjectConfiguration, installPackagesTask, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import { lintWorkspaceTask } from '@nx-squeezer/devkit';

import { writeEsLintConfig, readEsLintConfig, eslintConfigFile } from './eslint-config';
import eslintGenerator from './generator';
import { eslintSchematic } from './generator.compat';
import { deprecationRule, esLintRule, importOrderRule, sonarJSRule, typescriptRule, unusedImportsRule } from './rules';

const timeout = 10_000;

jest.mock('@nx-squeezer/devkit', () => ({
  ...jest.requireActual('@nx-squeezer/devkit'),
  lintWorkspaceTask: jest.fn(),
}));

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  installPackagesTask: jest.fn(),
}));

jest.setTimeout(10_000);

describe('@nx-squeezer/workspace eslint generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.spyOn(console, 'log').mockImplementation(() => null);
    writeEsLintConfig(tree, {});
  });

  it('should run successfully', async () => {
    await eslintGenerator(tree, {});

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig).toBeDefined();
  });

  it('should provide a schematic', async () => {
    expect(typeof eslintSchematic({})).toBe('function');
  });

  it('should run tasks', async () => {
    const tasks = await eslintGenerator(tree, {});

    tasks();

    expect(lintWorkspaceTask).toHaveBeenCalled();
    expect(installPackagesTask).toHaveBeenCalled();
  });

  it('should apply eslint:recommended', async () => {
    await eslintGenerator(tree, { eslintRecommended: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.overrides?.[0]).toStrictEqual(esLintRule);
    expect(eslintConfig.env).toStrictEqual({ node: true, browser: true, es2022: true });
  });

  it('should apply sonarjs/recommended', async () => {
    await eslintGenerator(tree, { sonarJs: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes('sonarjs')).toBeTruthy();
    expect(eslintConfig.overrides?.[0]).toStrictEqual(sonarJSRule);
  });

  it('should apply unused imports', async () => {
    await eslintGenerator(tree, { unusedImports: true });

    const eslintConfig = readEsLintConfig(tree);

    expect(eslintConfig.plugins?.includes('unused-imports')).toBeTruthy();
    expect(eslintConfig.overrides?.[0]).toStrictEqual(unusedImportsRule);
  });

  it(
    'should apply @typescript-eslint/recommended',
    async () => {
      addLibraries();

      await eslintGenerator(tree, { typescriptRecommended: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('@typescript-eslint')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual(typescriptRule);
      expect(readEsLintConfig(tree, `libs/lib1/${eslintConfigFile}`).overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: ['libs/lib1/tsconfig*.json'] },
      });
    },
    timeout
  );

  it(
    'should apply deprecation',
    async () => {
      addLibraries();

      await eslintGenerator(tree, { deprecation: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('deprecation')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual(deprecationRule);
      expect(readEsLintConfig(tree, `libs/lib1/${eslintConfigFile}`).overrides?.[0]).toStrictEqual({
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: ['libs/lib1/tsconfig*.json'] },
      });
    },
    timeout
  );

  it(
    'should apply import order',
    async () => {
      await eslintGenerator(tree, { importOrder: true });

      const eslintConfig = readEsLintConfig(tree);

      expect(eslintConfig.plugins?.includes('import')).toBeTruthy();
      expect(eslintConfig.overrides?.[0]).toStrictEqual(importOrderRule);
    },
    timeout
  );

  function addLibraries() {
    addProjectConfiguration(tree, 'lib1', {
      root: 'libs/lib1',
      sourceRoot: 'libs/lib1/src',
    });
    writeEsLintConfig(tree, {}, `libs/lib1/${eslintConfigFile}`);

    addProjectConfiguration(tree, 'lib2', {
      root: 'libs/lib2',
      sourceRoot: 'libs/lib2/src',
    });
  }
});
