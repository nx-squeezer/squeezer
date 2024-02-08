import { BuildExecutorSchema } from './schema';

/**
 * @ignore empty executor
 */
export default async function runExecutor(options: BuildExecutorSchema) {
  console.log('Executor ran for Build', options);
  return {
    success: true,
  };
}
