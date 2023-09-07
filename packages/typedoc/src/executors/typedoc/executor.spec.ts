import executor from './executor';
import { TypedocExecutorSchema } from './schema';

const options: TypedocExecutorSchema = {};

describe('Typedoc Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});
