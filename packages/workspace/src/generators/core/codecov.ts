import { join } from 'path';

import { getProjects, ProjectConfiguration, Tree, updateProjectConfiguration } from '@nrwl/devkit';
import { parse, stringify } from 'yaml';

import { slash } from './slash';

export const codecovFile = 'codecov.yml';
export const codecovHiddenFile = '.codecov.yml';

export interface CodecovConfig {
  target?: string;
  threshold?: string;
  flags?: string[];
}

export interface Codecov {
  comment?: {
    layout: 'reach';
    behavior: 'new';
    require_changes: boolean;
  };
  coverage?: {
    range: string;
    round: 'nearest';
    precision: number;
    status: {
      patch: {
        default: CodecovConfig;
      };
      project: {
        default: CodecovConfig;
        [key: string]: CodecovConfig;
      };
    };
  };
  flags?: {
    [key: string]: {
      paths: string[];
    };
  };
}

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

export function getCodecovFile(tree: Tree): string {
  return tree.exists(codecovFile) ? codecovFile : codecovHiddenFile;
}

export function readRawCodecov(tree: Tree): string {
  return tree.read(getCodecovFile(tree))?.toString() ?? '';
}

export function readCodecov(tree: Tree): Codecov {
  return parse(readRawCodecov(tree));
}

export function createCodecov(tree: Tree) {
  const codecovFile = getCodecovFile(tree);
  if (tree.exists(codecovFile)) {
    return;
  }
  writeCodecov(tree, codecovDefault);
}

export function writeCodecov(tree: Tree, codecov: Codecov): void {
  tree.write(getCodecovFile(tree), stringify(codecov));
}

export function writeProjectsToCodecov(tree: Tree): void {
  createCodecov(tree);
  const codecov = readCodecov(tree);

  console.log(`Generating ${getCodecovFile(tree)} file...`);

  const projects = getProjects(tree);
  const testableProjects: Map<string, ProjectConfiguration> = new Map();
  const ignoredProjects: string[] = [];

  projects.forEach((projectConfiguration: ProjectConfiguration, projectName: string) => {
    const testTarget = projectConfiguration.targets?.test;
    if (testTarget != null && testTarget.executor.includes('jest')) {
      testableProjects.set(projectName, projectConfiguration);
      testTarget.options = {
        ...testTarget.options,
        codeCoverage: true,
      };
      updateProjectConfiguration(tree, projectName, projectConfiguration);
      updateProjectJestCoverage(tree, testTarget.options.jestConfig);
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
    const flags = codecov.flags ?? {};
    flags[name] = { paths: [slash(join('coverage', project.root))] };
    codecov.flags = flags;

    if (codecov.coverage) {
      codecov.coverage.status.project[name] = { flags: [name] };
    }
  });

  writeCodecov(tree, codecov);
}

export function updateProjectJestCoverage(tree: Tree, jestConfigPath: string) {
  const jestFileContent = tree.read(jestConfigPath)?.toString() ?? '';

  if (jestFileContent.includes('coverageReporters')) {
    return;
  }

  const jestLines = jestFileContent.split('\n');

  for (let index = 0; index < jestLines.length; index++) {
    if (jestLines[index].includes('coverageDirectory')) {
      jestLines.splice(index + 1, 0, `"coverageReporters": ["lcov"],`);
      break;
    }
  }

  tree.write(jestConfigPath, jestLines.join(`\n`));
}
