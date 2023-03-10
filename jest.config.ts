import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  maxWorkers: '50%',
};
