import { SignalControl } from './signal-control';

/**
 * Signal control value accessor.
 */
export interface SignalControlValueAccessor<T = unknown> {
  /**
   * Model control.
   */
  control: SignalControl<T>;
}
