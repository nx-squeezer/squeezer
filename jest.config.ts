import { getJestProjects } from '@nx/jest';

export default {
  projects: getJestProjects(),
  maxWorkers: '50%',
};
