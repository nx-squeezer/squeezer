import { WritableSignal, computed, untracked } from '@angular/core';

/**
 * Creates a writable signal from a pair of getter and setter.
 */
export function composedSignal<T>({ get, set }: { get(): T; set(value: T): void }): WritableSignal<T> {
  const writableSignal = computed(() => get()) as WritableSignal<T>;

  writableSignal.set = set;
  writableSignal.update = (fn: (value: T) => T) => {
    set(fn(untracked(() => get())));
  };
  writableSignal.asReadonly = () => computed(() => get());

  return writableSignal;
}
