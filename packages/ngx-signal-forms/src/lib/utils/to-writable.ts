import { WritableSignal, computed, untracked } from '@angular/core';

/**
 * Creates a writable signal from a readonly signal with a set function that can run side effects.
 */
export function toWritable<T>(computation: () => T, setFn: (value: T) => void): WritableSignal<T> {
  const writableSignal = computed(() => computation()) as WritableSignal<T>;

  writableSignal.set = setFn;
  writableSignal.update = (fn: (value: T) => T) => {
    setFn(fn(untracked(() => computation())));
  };
  writableSignal.asReadonly = () => computed(() => computation());

  return writableSignal;
}
