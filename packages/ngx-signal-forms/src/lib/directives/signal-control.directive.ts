import { Directive, Signal, WritableSignal, computed, effect, input } from '@angular/core';

import { SignalControlStatus } from '../models/signal-control-status';
import { ValidationErrors } from '../models/validation-errors';
import { Validator } from '../models/validator';

/**
 * @internal
 */
const SIGNAL_CONTROL_DIRECTIVE = Symbol('signal-control-directive');

/**
 * @internal
 */
export function getSignalControlDirective<T>(writableSignal: WritableSignal<T>): SignalControlDirective<T> | undefined {
  return (writableSignal as any)[SIGNAL_CONTROL_DIRECTIVE];
}

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
  exportAs: 'ngxControl',
})
export class SignalControlDirective<T, V extends ValidationErrors = {}> {
  /**
   * Model.
   */
  readonly control = input.required<WritableSignal<T>>({ alias: 'ngxControl' });

  /**
   * @internal
   */
  protected branding = effect(() => {
    const control = this.control();
    (control as any)[SIGNAL_CONTROL_DIRECTIVE] = this;
  });

  /**
   * Validators.
   */
  readonly validators = input<readonly Validator<T, V>[]>([]);

  /**
   * Errors.
   */
  readonly errors: Signal<ValidationErrors | null> = computed<ValidationErrors | null>(() => {
    const control = this.control();
    const value = control();
    const validationResult: ValidationErrors = this.validators().reduce(
      (result, validator) => ({ ...result, ...(validator(value) ?? {}) }),
      {}
    );
    return Object.keys(validationResult).length > 0 ? validationResult : null;
  });

  /**
   * The validation status of the control.
   */
  readonly status: Signal<SignalControlStatus> = computed(() => (this.errors() == null ? 'VALID' : 'INVALID'));

  /**
   * The validation status of the control.
   */
  readonly valid: Signal<boolean> = computed(() => this.status() === 'VALID');

  /**
   * Whether the control is in invalid state.
   */
  readonly invalid: Signal<boolean> = computed(() => this.status() === 'INVALID');
}
