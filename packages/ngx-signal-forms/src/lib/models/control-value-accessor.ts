import { WritableSignal } from '@angular/core';

/**
 * Signal control value accessor.
 */
export interface SignalControlValueAccessor<T = unknown> {
  /**
   * Model control.
   */
  control: WritableSignal<T>;
}
