import { noopTask } from './noop-task';

describe('@nx-squeezer/workspace noopTask', () => {
  it('should execute the task', () => {
    expect(noopTask()).toBeFalsy();
  });
});
