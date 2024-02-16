import { signal, WritableSignal } from '@angular/core';

import { toWritable } from './to-writable';

describe('toWritable', () => {
  let sourceSignal: WritableSignal<number>;
  let setFn: jest.Mock;
  let writableSignal: WritableSignal<number>;

  beforeEach(() => {
    sourceSignal = signal(1);
    setFn = jest.fn().mockImplementation((value: number) => sourceSignal.set(value));
    writableSignal = toWritable(() => sourceSignal(), setFn);
  });

  it('should use set interceptor when using set', () => {
    writableSignal.set(2);

    expect(setFn).toHaveBeenCalledWith(2);
  });

  it('should use set interceptor when using update', () => {
    const updateFn = jest.fn().mockImplementation((value) => value + 1);
    writableSignal.update(updateFn);

    expect(updateFn).toHaveBeenCalledWith(1);
    expect(setFn).toHaveBeenCalledWith(2);
  });

  it('should return a readonly signal with the same value as the original', () => {
    writableSignal.set(2);
    const readonlySignal = writableSignal.asReadonly();

    expect(readonlySignal()).toBe(2);
  });
});
