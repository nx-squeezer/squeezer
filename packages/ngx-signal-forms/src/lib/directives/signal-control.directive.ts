import { Directive, Signal, WritableSignal, computed, effect, input, signal } from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { SignalControlStatus } from '../models/signal-control-status';
import { SignalControlStatusClasses } from '../models/signal-control-status-classes';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { ValidationErrors } from '../models/validation-errors';
import { Validator } from '../models/validator';

// TODO: touched/untouched (blur)
// TODO: disabled
// TODO: DOM attributes/validators, from CVA
// TODO: adjust visibility of errors based on interaction

type Keys<T> = T extends T ? keyof T : never;

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
  host: {
    [`[class.${SignalControlStatusClasses.valid}]`]: 'valid()',
    [`[class.${SignalControlStatusClasses.invalid}]`]: 'invalid()',
    [`[class.${SignalControlStatusClasses.pristine}]`]: 'pristine()',
    [`[class.${SignalControlStatusClasses.dirty}]`]: 'dirty()',
  },
  exportAs: 'ngxControl',
})
export class SignalControlDirective<T, V extends ValidationErrors = {}> {
  /**
   * Model.
   */
  readonly control = input.required<WritableSignal<Readonly<T>>>({ alias: 'ngxControl' });

  readonly #parent = signal<SignalControlContainer<any> | null>(null);

  /**
   * When the control is a child of a control container, this reactive value exposes a reference to its parent.
   */
  readonly parent = this.#parent.asReadonly();

  /**
   * Default key when the control is not a child of a control container.
   */
  readonly defaultKey: string = 'control';
  readonly #key = signal<string | number | null>(null);

  /**
   * When the control is a child of a control container, this reactive value exposes the key to which it belongs.
   */
  readonly key = this.#key.asReadonly();

  /**
   * When the control is a child of a control container, this reactive value exposes its relative path.
   * For standalone controls it returns the default key.
   */
  readonly path = computed((): string | null => {
    const parent = this.parent();
    const parentPath = parent?.path();
    const key = this.key();
    return parentPath != null && key != null ? `${parentPath}.${key}` : this.defaultKey;
  });

  /**
   * @internal
   */
  protected readonly registerControl = effect(
    (cleanup) => {
      const control = this.control();
      const controlContainer: SignalControlContainer<any> | undefined = (control as any)[SIGNAL_CONTROL_CONTAINER];
      const controlKey: string | number | undefined = (control as any)[SIGNAL_CONTROL_KEY];

      if (controlContainer == null || controlKey == null) {
        return;
      }

      controlContainer.addControl(controlKey, this as unknown as SignalControlDirective<any, {}>);
      this.#parent.set(controlContainer);
      this.#key.set(controlKey);

      cleanup(() => {
        controlContainer.removeControl(controlKey);
        this.#parent.set(null);
        this.#key.set(null);
      });
    },
    { allowSignalWrites: true }
  );

  /**
   * Validators.
   */
  readonly validator = input<Validator<T, V>>();

  /**
   * Errors.
   */
  readonly errors: Signal<Readonly<V> | null> = computed<Readonly<V> | null>(() => {
    const validator = this.validator();
    if (validator == null) {
      return null;
    }

    const control = this.control();
    const value = control();
    return validator(value);
  });

  /**
   * Reactive value of a specific error.
   */
  error<K extends Keys<V>>(key: K): V[K] | null {
    const errors = this.errors();
    return errors == null ? null : errors[key] ?? null;
  }

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

  readonly #pristine: WritableSignal<boolean> = signal(true);

  /**
   * A control is pristine if the user has not yet changed the value in the UI.
   */
  readonly pristine: Signal<boolean> = this.#pristine.asReadonly();

  /**
   * A control is dirty if the user has changed the value in the UI.
   */
  readonly dirty: Signal<boolean> = computed(() => !this.pristine());

  /**
   * Marks the control as pristine.
   */
  markAsPristine(): void {
    this.#pristine.set(true);
  }

  /**
   * Marks the control as dirty. A control becomes dirty when the control's value is changed through the UI; compare markAsTouched.
   */
  markAsDirty(): void {
    this.#pristine.set(false);
  }
}
