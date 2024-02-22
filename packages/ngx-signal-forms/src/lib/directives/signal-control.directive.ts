import { Directive, Signal, WritableSignal, computed, effect, inject, input, signal } from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { SignalControlStatus } from '../models/signal-control-status';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { ValidationErrors } from '../models/validation-errors';
import { Validator } from '../models/validator';
import { SIGNAL_CONTROL_STATUS_CLASSES } from '../tokens/control-status-classes.token';

// TODO: pristine/dirty (value changed)
// TODO: touched/untouched (blur)
// TODO: disabled
// TODO: DOM attributes/validators, from CVA
// TODO: adjust visibility of errors based on interaction

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
  exportAs: 'ngxControl',
})
export class SignalControlDirective<T, V extends ValidationErrors = {}> {
  /**
   * Control status classes that will be applied to the host element.
   */
  protected readonly statusClasses = inject(SIGNAL_CONTROL_STATUS_CLASSES);

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

  readonly #registerControl = effect(
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
  readonly validators = input<readonly Validator<T, V>[]>([]);

  /**
   * Errors.
   */
  readonly errors: Signal<Readonly<V> | null> = computed<Readonly<V> | null>(() => {
    const control = this.control();
    const value = control();
    const validationResult: Readonly<V> = this.validators().reduce(
      (result, validator) => ({ ...result, ...(validator(value) ?? {}) }),
      {} as V
    );
    return Object.keys(validationResult).length > 0 ? validationResult : null;
  });

  /**
   * Reactive value of a specific error.
   */
  error<K extends keyof V>(key: K): V[K] | null {
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

  /**
   * CSS classes to be applied to the host element depending on the status.
   */
  readonly classes: Signal<string> = computed(() => {
    switch (this.status()) {
      case 'VALID':
        return this.statusClasses.valid;
      case 'INVALID':
        return this.statusClasses.invalid;
    }
  });
}
