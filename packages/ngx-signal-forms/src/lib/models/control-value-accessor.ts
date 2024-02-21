import { InputSignal, WritableSignal } from '@angular/core';

/**
 * Signal control value accessor.
 */
export interface SignalControlValueAccessor<T = unknown> {
  /**
   * Model control.
   */
  readonly control: InputSignal<WritableSignal<T>>;
}
