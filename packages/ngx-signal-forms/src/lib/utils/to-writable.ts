import { Signal, WritableSignal, untracked } from '@angular/core';

/**
 * Creates a writable signal from a readonly signal with a set function that can run side effects.
 */
export function toWritable<T>(readonlySignal: Signal<T>, setFn: (value: T) => void): WritableSignal<T> {
  const writableSignal = readonlySignal as WritableSignal<T>;

  writableSignal.set = setFn;
  writableSignal.update = (fn: (value: T) => T) => {
    setFn(fn(untracked(() => readonlySignal())));
  };
  writableSignal.asReadonly = () => readonlySignal;

  return writableSignal;
}
