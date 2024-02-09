import { computed, effect, signal, untracked } from '@angular/core';

import { SignalControl, SignalControlNode, control } from './signal-control';

/**
 * @internal
 */
export interface SignalFormGroupNode<T extends object> extends SignalControlNode<T> {
  get<K extends keyof T>(key: K): SignalControl<T[K]>;
}

/**
 * Model of a form group backed with signals.
 */
export interface SignalFormGroup<T extends object = {}> extends SignalControl<T> {
  /**
   * Returns the child control corresponding to a given key.
   */
  get<K extends keyof T>(key: K): SignalControl<T[K]>;
}

/**
 * Maps an object type to a collection of controls.
 */
export type SignalFormGroupControls<T extends object> = {
  [K in keyof T]?: SignalControl<T[K]>;
};

/**
 * Factory function to create a signal form group.
 */
export function formGroup<T extends object = {}>(initialValue: T): SignalFormGroup<T> {
  const formGroupSignal = signal(initialValue) as SignalFormGroupNode<T>;
  formGroupSignal.valid = computed(() => true);

  // Control container
  const controlsMap: SignalFormGroupControls<T> = {};
  const controls = signal<Readonly<SignalFormGroupControls<T>>>(controlsMap);

  formGroupSignal.get = <K extends keyof T>(key: K): SignalControl<T[K]> => {
    const controlByKey = controlsMap[key] ?? control(untracked(() => formGroupSignal())[key]);
    controlsMap[key] = controlByKey;
    return controlByKey;
  };

  // Sync value to child controls
  effect(
    () => {
      Object.entries(formGroupSignal()).forEach(([key, value]) => {
        formGroupSignal.get(key as keyof T).set(value);
      });
    },
    { allowSignalWrites: true }
  );

  // Sync value from child controls
  effect(
    () => {
      const newValue = Object.entries(controls()).reduce((combinedValue, [key, controlByKey]) => {
        const value: any = (controlByKey as SignalControl<unknown>)();
        combinedValue[key as keyof T] = value;
        return combinedValue;
      }, {} as T);
      formGroupSignal.set(newValue);
    },
    { allowSignalWrites: true }
  );

  return formGroupSignal;
}
