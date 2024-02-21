import { Directive, Signal, WritableSignal, computed, effect, input } from '@angular/core';

import { SignalControlContainer } from './signal-control-container';
import { SignalControlStatus } from '../models/signal-control-status';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { ValidationErrors } from '../models/validation-errors';
import { Validator } from '../models/validator';

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
  readonly control = input.required<WritableSignal<Readonly<T>>>({ alias: 'ngxControl' });

  /**
   * @internal
   */
  protected registerControl = effect(
    (cleanup) => {
      const control = this.control();
      const controlContainer: SignalControlContainer<any> | undefined = (control as any)[SIGNAL_CONTROL_CONTAINER];
      const controlKey: string | number | undefined = (control as any)[SIGNAL_CONTROL_KEY];

      if (controlContainer != null && controlKey != null) {
        controlContainer.addControl(controlKey, this as unknown as SignalControlDirective<any, {}>);
        cleanup(() => controlContainer.removeControl(controlKey));
      }
    },
    { allowSignalWrites: true }
  );

  /**
   * Validators.
   */
  readonly validators = input<readonly Validator<T, V>[]>([]);

  /**
   * Errors.
   */
  readonly errors: Signal<Readonly<ValidationErrors> | null> = computed<Readonly<ValidationErrors> | null>(() => {
    const control = this.control();
    const value = control();
    const validationResult: Readonly<ValidationErrors> = this.validators().reduce(
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
