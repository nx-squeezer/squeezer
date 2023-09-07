import { TypedocExecutorSchema } from './schema';

export default async function runExecutor(options: TypedocExecutorSchema) {
  console.log('Executor ran for Typedoc', options);
  return {
    success: true,
  };
}
