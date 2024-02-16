import { WritableSignal } from '@angular/core';

/**
 * @internal
 */
const CONTROL_SIGNAL = Symbol('control-signal');

/**
 * Control signal that has additional information about that control.
 */
export interface ControlSignal<T> extends WritableSignal<T> {
  /**
   * Object brand.
   * @internal
   */
  [CONTROL_SIGNAL]: WritableSignal<T>;
}

/**
 * Creates a control signal out of a writable signal.
 */
export function toControl<T>(writableSignal: WritableSignal<T>): ControlSignal<T> {
  const controlSignal = writableSignal as ControlSignal<T>;
  controlSignal[CONTROL_SIGNAL] = writableSignal;
  return controlSignal;
}

/**
 * Checks whether a writable signal is a control.
 */
export function isControl<T>(writableSignal: WritableSignal<T>): writableSignal is ControlSignal<T> {
  return (writableSignal as any)[CONTROL_SIGNAL] != null;
}
