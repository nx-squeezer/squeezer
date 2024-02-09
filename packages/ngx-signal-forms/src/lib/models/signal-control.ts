import { Signal, WritableSignal, computed, signal } from '@angular/core';

/**
 * @internal
 */
interface SignalControlNode<T> extends WritableSignal<T> {
  valid: Signal<boolean>;
}

/**
 * Model of a control backed with signals.
 */
export interface SignalControl<T = unknown> extends WritableSignal<T> {
  /**
   * Valid state.
   */
  readonly valid: Signal<boolean>;
}

/**
 * Factory function to create a signal control.
 */
export function control<T = unknown>(initialValue: T): SignalControl<T> {
  const controlSignal = signal(initialValue) as SignalControlNode<T>;
  controlSignal.valid = computed(() => true);
  return controlSignal;
}
