import { noopTask } from './noop-task';

describe('@nx-squeezer/devkit noopTask', () => {
  it('should execute the task', () => {
    expect(noopTask()).toBeFalsy();
  });
});
