import { InputSignal, OutputEmitterRef, WritableSignal, effect, signal } from '@angular/core';

import { composedSignal } from './composed-signal';

/**
 * Creates a writable signal from a pair of input/output.
 */
export function modelFrom<T>({
  input,
  output,
}: {
  input: () => InputSignal<T>;
  output: () => OutputEmitterRef<T>;
}): WritableSignal<T> {
  const baseSignal = signal(undefined as T);
  const lastValueFromInput = signal(true);

  effect(
    () => {
      baseSignal.set(input()());
      lastValueFromInput.set(true);
    },
    { allowSignalWrites: true }
  );

  return composedSignal<T>({
    get: () => (lastValueFromInput() ? input()() : baseSignal()),
    set: (value) => {
      baseSignal.set(value);
      lastValueFromInput.set(false);
      output().emit(value);
    },
  });
}
