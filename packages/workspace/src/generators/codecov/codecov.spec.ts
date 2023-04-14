import { addProjectConfiguration, Tree, readProjectConfiguration, updateProjectConfiguration } from '@nrwl/devkit';
import { createTree, createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import {
  codecovDefault,
  codecovDotFile,
  codecovFile,
  createCodecov,
  getCodecovFile,
  readCodecov,
  readRawCodecov,
  updateProjectJestCoverage,
  writeCodecov,
  writeProjectsToCodecov,
} from './codecov';

const jestExecutor = '@nrwl/jest:jest';

describe('@nx-squeezer/workspace codecov', () => {
  let tree: Tree;
  const jestConfigPath = 'libs/lib1/jest.config.ts';

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => null);
  });

  describe('config file', () => {
    beforeEach(() => {
      tree = createTree();
    });

    it('should get codecov config', () => {
      tree.write(codecovFile, '');

      expect(getCodecovFile(tree)).toBe(codecovFile);
    });

    it('should default to codecov dot config', () => {
      expect(getCodecovFile(tree)).toBe(codecovDotFile);
    });

    it('should read the codecov config if not existing', () => {
      expect(readRawCodecov(tree)).toBe('');
    });

    it('should read the codecov config contents', () => {
      writeCodecov(tree, codecovDefault);

      expect(readRawCodecov(tree).length).toBeGreaterThan(0);
    });

    it('should parse the codecov config', () => {
      writeCodecov(tree, codecovDefault);

      expect(readCodecov(tree)).toStrictEqual(codecovDefault);
    });

    it('should create codecov default config', () => {
      createCodecov(tree);

      expect(readCodecov(tree)).toStrictEqual(codecovDefault);
    });

    it('should not overwrite existing codecov file', () => {
      tree.write(codecovFile, '');
      createCodecov(tree);

      expect(readRawCodecov(tree)).toBe('');
    });
  });

  describe('update codecov projects', () => {
    beforeEach(() => {
      tree = createTreeWithEmptyWorkspace();
    });

    it('should configure the project, jest configuration and codecov', () => {
      addTestableLibrary();

      writeProjectsToCodecov(tree);

      expect(readProjectConfiguration(tree, 'lib1').targets?.test).toStrictEqual({
        executor: jestExecutor,
        outputs: ['coverage/libs/lib1'],
        options: {
          jestConfig: jestConfigPath,
          passWithNoTests: true,
          codeCoverage: true,
        },
      });
      expect(tree.read(jestConfigPath)?.includes(`"coverageReporters": ["lcov"]`)).toBeTruthy();
      expect(readCodecov(tree).flags).toStrictEqual({ lib1: { paths: ['libs/lib1'] } });
      expect(readCodecov(tree).coverage?.status.project.lib1).toStrictEqual({ flags: ['lib1'] });
    });

    it('should update jest configuration even if not defined in options', () => {
      addTestableLibrary();
      const project = readProjectConfiguration(tree, 'lib1');
      project.targets = {
        ...project.targets,
        test: {
          executor: jestExecutor,
        },
      };
      updateProjectConfiguration(tree, 'lib1', project);

      writeProjectsToCodecov(tree);

      expect(tree.read(jestConfigPath)?.includes(`"coverageReporters": ["lcov"]`)).toBeTruthy();
    });

    it('should ignore non testable projects', () => {
      addProjectConfiguration(tree, 'lib2', {
        root: 'libs/lib2',
        sourceRoot: 'libs/lib2/src',
        targets: {},
      });
      addProjectConfiguration(tree, 'lib3', {
        root: 'libs/lib3',
        sourceRoot: 'libs/lib3/src',
        targets: {
          test: {
            executor: 'cypress',
          },
        },
      });
      addProjectConfiguration(tree, 'lib4', {
        root: 'libs/lib4',
        sourceRoot: 'libs/lib4/src',
      });

      addProjectConfiguration(tree, 'lib5', {
        root: 'libs/lib5',
        sourceRoot: 'libs/lib5/src',
        targets: {
          test: {
            command: 'npm run test',
          },
        },
      });

      writeProjectsToCodecov(tree);

      expect(console.log).toHaveBeenCalledWith(
        `Ignored projects where a test target with a jest executor was not detected: lib2, lib3, lib4, lib5`
      );
    });

    it('should just create codecov file if no projects exist', () => {
      writeProjectsToCodecov(tree);

      expect(console.log).toHaveBeenCalledWith(`There are no projects that can be configured with codecov.`);
      expect(tree.exists(codecovDotFile)).toBeTruthy();
    });

    it('should not overwrite coverage reporters if already existing', () => {
      tree.write(
        jestConfigPath,
        `export default {
          coverageDirectory: '../../coverage/libs/lib1',
          coverageReporters: ['lcov'],
        };`
      );

      updateProjectJestCoverage(tree, jestConfigPath);

      expect(console.log).toHaveBeenCalledWith(`Coverage reporters already configured for file: ${jestConfigPath}`);
    });

    it('should fail if jest config does not exist', () => {
      expect(() => updateProjectJestCoverage(tree, jestConfigPath)).toThrowError(
        `Jest config expected at path: ${jestConfigPath}`
      );
    });
  });

  function addTestableLibrary() {
    addProjectConfiguration(tree, 'lib1', {
      root: 'libs/lib1',
      sourceRoot: 'libs/lib1/src',
      targets: {
        test: {
          executor: jestExecutor,
          outputs: ['coverage/libs/lib1'],
          options: {
            jestConfig: jestConfigPath,
            passWithNoTests: true,
          },
        },
      },
    });
    tree.write(
      jestConfigPath,
      `export default {
          coverageDirectory: '../../coverage/libs/lib1'
        };`
    );
  }
});
