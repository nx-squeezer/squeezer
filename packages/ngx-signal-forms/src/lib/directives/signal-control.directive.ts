import {
  Directive,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { SignalControlStatus } from '../models/signal-control-status';
import {
  SignalValidationResult,
  SignalValidator,
  SignalValidatorKeys,
  SignalValidatorResultByKey,
  SignalValidatorResults,
} from '../models/signal-validator';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { SIGNAL_CONTROL_STATUS_CLASSES } from '../tokens/signal-control-status-classes.token';

// TODO: touched/untouched (blur)
// TODO: disabled
// TODO: DOM attributes/validators, from CVA
// TODO: adjust visibility of errors based on interaction
// TODO: set id for label

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
  host: {
    '[class]': 'classList()',
  },
  exportAs: 'ngxControl',
})
export class SignalControlDirective<TValue, TValidators extends SignalValidator<TValue, string>[] = []> {
  private readonly statusClasses = inject(SIGNAL_CONTROL_STATUS_CLASSES);

  /**
   * Model.
   */
  readonly control: InputSignal<WritableSignal<Readonly<TValue>>> = input.required<WritableSignal<Readonly<TValue>>>({
    alias: 'ngxControl',
  });

  /**
   * Model value.
   */
  readonly value: Signal<Readonly<TValue>> = computed(() => this.control()());

  readonly #parent: WritableSignal<SignalControlContainer<any, []> | null> = signal<SignalControlContainer<any> | null>(
    null
  );

  /**
   * When the control is a child of a control container, this reactive value exposes a reference to its parent.
   */
  readonly parent: Signal<SignalControlContainer<any, []> | null> = this.#parent.asReadonly();

  /**
   * Default key when the control is not a child of a control container.
   */
  readonly defaultKey: string = 'control';
  readonly #key: WritableSignal<string | number | null> = signal<string | number | null>(null);

  /**
   * When the control is a child of a control container, this reactive value exposes the key to which it belongs.
   */
  readonly key: Signal<string | number | null> = this.#key.asReadonly();

  /**
   * When the control is a child of a control container, this reactive value exposes its relative path.
   * For standalone controls it returns the default key.
   */
  readonly path: Signal<string | null> = computed((): string | null => {
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

      controlContainer.addControl(controlKey, this as unknown as SignalControlDirective<any>);
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
  readonly validators: InputSignalWithTransform<
    Readonly<TValidators>,
    Readonly<TValidators> | (TValidators extends infer TValidator ? TValidator : never)
  > = input([] as unknown as Readonly<TValidators>, {
    transform(
      input: Readonly<TValidators> | (TValidators extends infer TValidator ? TValidator : never)
    ): Readonly<TValidators> {
      return Array.isArray(input) ? input : ([input] as any);
    },
  });

  /**
   * Errors.
   */
  readonly errors: Signal<Readonly<SignalValidatorResults<TValidators>>> = computed(
    (): Readonly<SignalValidatorResults<TValidators>> => {
      const validators = this.validators();
      if (validators.length === 0) {
        return [] as SignalValidatorResults<TValidators>;
      }

      const control = this.control();
      const value = control();
      const errors: SignalValidationResult<any>[] = [];

      for (const validator of validators) {
        if (!validator.validate(value)) {
          errors.push({ key: validator.key, config: validator.config });
        }
      }

      return errors as SignalValidatorResults<TValidators>;
    }
  );

  readonly #errorMap: Signal<Map<string, SignalValidationResult<any>>> = computed(
    () => new Map<string, SignalValidationResult<any>>(this.errors().map((error) => [error.key, error]))
  );

  /**
   * Reactive value of a specific error.
   */
  error<K extends SignalValidatorKeys<TValidators>>(
    errorKey: K
  ): SignalValidatorResultByKey<TValidators, K> | undefined {
    return this.#errorMap().get(errorKey) as any;
  }

  /**
   * The validation status of the control.
   */
  readonly status: Signal<SignalControlStatus> = computed(() => (this.errors().length > 0 ? 'INVALID' : 'VALID'));

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

  /**
   * Class list to style the input.
   * @internal
   */
  protected readonly classList: Signal<{ [x: string]: boolean }> = computed(() => ({
    [this.statusClasses.valid]: this.valid(),
    [this.statusClasses.invalid]: this.invalid(),
    [this.statusClasses.pristine]: this.pristine(),
    [this.statusClasses.dirty]: this.dirty(),
  }));
}
