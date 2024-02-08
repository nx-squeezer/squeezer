import { getProjects, ProjectConfiguration, Tree, updateProjectConfiguration } from '@nx/devkit';
import { parse, stringify } from 'yaml';

import { joinNormalize } from '@nx-squeezer/devkit';

/**
 * Filename of codecov configuration.
 */
export const codecovFile = 'codecov.yml';

/**
 * Filename of codecov dot configuration.
 */
export const codecovDotFile = '.codecov.yml';

/**
 * Codecov coverage configuration.
 */
export interface CodecovConfig {
  /**
   * Target project.
   */
  target?: string;

  /**
   * Threshold for test coverage.
   */
  threshold?: string;

  /**
   * Codecov flags.
   */
  flags?: string[];
}

/**
 * Codecov configuration.
 */
export interface Codecov {
  /** Comment */
  comment?: {
    /** Layout */
    layout: 'reach';
    /** Behavior */
    behavior: 'new';
    /** Require changes */
    require_changes: boolean;
  };
  /** Coverage */
  coverage: {
    /** Range */
    range: string;
    /** Round */
    round: 'nearest';
    /** Precision */
    precision: number;
    /** Status */
    status: {
      /** Patch */
      patch: {
        /** Default */
        default: CodecovConfig;
      };
      /** Project */
      project: {
        /** Default */
        default: CodecovConfig;
        /** configuration */
        [key: string]: CodecovConfig;
      };
    };
  };
  /** Flags */
  flags?: {
    /** Flag keys */
    [key: string]: {
      /** Paths */
      paths: string[];
    };
  };
}

/**
 * Default codecov configuration.
 */
export const codecovDefault: Codecov = {
  comment: {
    layout: 'reach',
    behavior: 'new',
    require_changes: true,
  },
  coverage: {
    range: '0..100',
    round: 'nearest',
    precision: 1,
    status: {
      patch: {
        default: {
          target: '50%',
          threshold: '10%',
        },
      },
      project: {
        default: {
          target: '50%',
          threshold: '10%',
        },
      },
    },
  },
};

/**
 * Returns the filename of current codecov configuration.
 */
export function getCodecovFile(tree: Tree): string {
  return tree.exists(codecovFile) ? codecovFile : codecovDotFile;
}

/**
 * Reads codecov raw configuration.
 */
export function readRawCodecov(tree: Tree): string {
  return tree.read(getCodecovFile(tree))?.toString() ?? '';
}

/**
 * Reads codecov configuration.
 */
export function readCodecov(tree: Tree): Codecov {
  return parse(readRawCodecov(tree));
}

/**
 * Generates codecov configuration.
 */
export function createCodecov(tree: Tree) {
  const codecovFile = getCodecovFile(tree);
  if (tree.exists(codecovFile)) {
    return;
  }
  writeCodecov(tree, codecovDefault);
}

/**
 * Saves codecov configuration.
 */
export function writeCodecov(tree: Tree, codecov: Codecov): void {
  tree.write(getCodecovFile(tree), stringify(codecov));
}

/**
 * Adds projects to codecov configuration.
 */
export function writeProjectsToCodecov(tree: Tree): void {
  createCodecov(tree);
  const codecov = readCodecov(tree);

  console.log(`Generating ${getCodecovFile(tree)} file...`);

  const projects = getProjects(tree);
  const testableProjects: Map<string, ProjectConfiguration> = new Map();
  const ignoredProjects: string[] = [];

  projects.forEach((projectConfiguration: ProjectConfiguration, projectName: string) => {
    const testTarget = projectConfiguration.targets?.test;
    if (testTarget != null && testTarget.executor?.includes('jest')) {
      testableProjects.set(projectName, projectConfiguration);
      testTarget.options = {
        ...testTarget.options,
        codeCoverage: true,
      };
      updateProjectConfiguration(tree, projectName, projectConfiguration);
      updateProjectJestCoverage(tree, testTarget.options.jestConfig ?? `${projectConfiguration.root}/jest.config.ts`);
    } else {
      ignoredProjects.push(projectName);
    }
  });

  if (ignoredProjects.length > 0) {
    const ignoredProjectsList: string = ignoredProjects.join(`, `);
    console.log(`Ignored projects where a test target with a jest executor was not detected: ${ignoredProjectsList}`);
  }

  if (testableProjects.size === 0) {
    console.log(`There are no projects that can be configured with codecov.`);
    return;
  }

  testableProjects.forEach((project: ProjectConfiguration, name: string) => {
    const newFlags: Codecov['flags'] = {};
    newFlags[name] = { paths: [joinNormalize(project.root)] };
    codecov.flags = { ...codecov.flags, ...newFlags };

    codecov.coverage.status.project[name] = { flags: [name] };
  });

  writeCodecov(tree, codecov);
}

/**
 * Updates test coverage configuration for jest.
 */
export function updateProjectJestCoverage(tree: Tree, jestConfigPath: string) {
  const jestFileContent: string | undefined = tree.read(jestConfigPath)?.toString();

  if (jestFileContent == null) {
    throw new Error(`Jest config expected at path: ${jestConfigPath}`);
  }

  if (jestFileContent.includes('coverageReporters')) {
    console.log(`Coverage reporters already configured for file: ${jestConfigPath}`);
    return;
  }

  const jestLines = jestFileContent.split('\n');

  for (let index = 0; index < jestLines.length; index++) {
    if (jestLines[index].includes('coverageDirectory')) {
      jestLines[index] = `${jestLines[index]},`.replace(/,,$/, ',');
      jestLines.splice(index + 1, 0, `"coverageReporters": ["lcov"],`);
      break;
    }
  }

  tree.write(jestConfigPath, jestLines.join(`\n`));
}
