import { WritableSignal, untracked } from '@angular/core';

import { toWritable } from './to-writable';

/**
 * Given a writable signal with an object value returns a signal that represents the value of a property.
 * It is also writable, when updated emits a new value treating it as immutable.
 */
export function selectObjectProperty<T extends object, K extends keyof T>(
  sourceSignal: WritableSignal<Readonly<T>>,
  key: K
): WritableSignal<Readonly<T[K]>> {
  return toWritable(
    () => sourceSignal()[key],
    (value: T[K]) => {
      const objectValue = untracked(() => sourceSignal());
      if (!Object.is(objectValue[key], value)) {
        sourceSignal.set({ ...objectValue, [key]: value });
      }
    }
  );
}
