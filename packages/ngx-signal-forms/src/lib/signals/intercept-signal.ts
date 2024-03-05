import { WritableSignal } from '@angular/core';

/**
 * Interface returned by interceptSignal that supports restoring the behavior.
 */
export interface SignalInterceptor {
  /**
   * Restores the original signal as it was.
   */
  restore(): void;
}

/**
 * Method that intercepts a signal setter and calls a function when that happens. Returns a reference to restore it as it was.
 */
export function interceptSignal<T>(signal: WritableSignal<T>, { onSet }: { onSet(value: T): void }): SignalInterceptor {
  const originalSet = signal.set;
  signal.set = (value: T) => {
    originalSet(value);
    onSet(value);
  };
  return {
    restore: () => {
      signal.set = originalSet;
    },
  };
}
