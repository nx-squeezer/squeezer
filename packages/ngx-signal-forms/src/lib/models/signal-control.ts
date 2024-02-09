import { signal } from '@angular/core';

/**
 * Model of a control backed with signals.
 */
export class SignalControl<T = unknown> {
  /**
   * Value of the control.
   */
  readonly value = signal(this.initialValue);

  /**
   * Signal control constructor.
   * @param initialValue Control's initial value.
   */
  constructor(readonly initialValue: T) {}
}

/**
 * Factory function to create a signal control.
 */
export function control<T = unknown>(initialValue: T): SignalControl<T> {
  return new SignalControl(initialValue);
}
