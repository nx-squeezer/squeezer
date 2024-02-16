import { Signal, WritableSignal, computed, signal } from '@angular/core';

import { SignalControlStatus } from './signal-control-status';
import { ValidationErrors } from './validation-errors';
import { Validator } from './validator';

/**
 * @internal
 */
const CONTROL_SIGNAL = Symbol('control-signal');

/**
 * Control signal that has additional information about that control.
 */
export interface ControlSignal<T, V extends ValidationErrors = {}> extends WritableSignal<T> {
  /**
   * Validators.
   */
  readonly validators: WritableSignal<readonly Validator<T, V>[]>;

  /**
   * Errors.
   */
  readonly errors: Signal<ValidationErrors | null>;

  /**
   * The validation status of the control.
   */
  readonly status: Signal<SignalControlStatus>;

  /**
   * Whether the control is in valid state.
   */
  readonly valid: Signal<boolean>;

  /**
   * Whether the control is in invalid state.
   */
  readonly invalid: Signal<boolean>;
}

/**
 * Creates a control given its initial value.
 */
export function control<T>(initialValue: T): ControlSignal<T> {
  return toControl(signal(initialValue));
}

/**
 * Creates a control signal out of a writable signal.
 */
export function toControl<T>(writableSignal: WritableSignal<T>): ControlSignal<T> {
  const controlSignal: any = writableSignal;
  const validators: WritableSignal<readonly Validator<T, {}>[]> = signal([]);
  const errors: Signal<ValidationErrors | null> = computed<ValidationErrors | null>(() => {
    const value = writableSignal();
    const validationResult: ValidationErrors = validators().reduce(
      (result, validator) => ({ ...result, ...(validator(value) ?? {}) }),
      {}
    );
    return Object.keys(validationResult).length > 0 ? validationResult : null;
  });
  const status: Signal<SignalControlStatus> = computed(() => (errors() == null ? 'VALID' : 'INVALID'));
  const valid: Signal<boolean> = computed(() => status() === 'VALID');
  const invalid: Signal<boolean> = computed(() => status() === 'INVALID');

  controlSignal[CONTROL_SIGNAL] = writableSignal;
  controlSignal.validators = validators;
  controlSignal.errors = errors;
  controlSignal.status = status;
  controlSignal.valid = valid;
  controlSignal.invalid = invalid;

  return controlSignal;
}

/**
 * Checks whether a writable signal is a control.
 */
export function isControl<T>(writableSignal: WritableSignal<T>): writableSignal is ControlSignal<T> {
  return (writableSignal as any)[CONTROL_SIGNAL] != null;
}
