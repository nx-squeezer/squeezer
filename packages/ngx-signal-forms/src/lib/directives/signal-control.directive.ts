import {
  Directive,
  InputSignal,
  InputSignalWithTransform,
  ModelSignal,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { DisabledType, EnabledType } from '../models/disabled-type';
import { SignalControlStatus } from '../models/signal-control-status';
import {
  SignalValidationResult,
  SignalValidator,
  SignalValidatorKeys,
  SignalValidatorResultByKey,
  SignalValidatorResults,
} from '../models/signal-validator';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { composeSignal } from '../signals/compose-signal';
import { interceptSignal } from '../signals/intercept-signal';
import { SIGNAL_CONTROL_STATUS_CLASSES } from '../tokens/signal-control-status-classes.token';

// TODO: DOM attributes/validators, from CVA
// TODO: set id for label and aria description for errors

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
  host: {
    '[class]': 'classList()',
    '[attr.disabled]': 'disabledAttribute()',
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
   * Disabled controls are exempt from validation checks and are not included in the aggregate value of their ancestor controls.
   */
  readonly disabled: ModelSignal<DisabledType<TValue>> = model(false as DisabledType<TValue>, { alias: 'ngxDisabled' });

  /**
   * Indicates if the control is not disabled.
   */
  readonly enabled: WritableSignal<EnabledType<TValue>> = composeSignal<EnabledType<TValue>>({
    get: () => !this.disabled() as EnabledType<TValue>,
    set: (enabled) => this.disabled.set(!enabled as DisabledType<TValue>),
  });

  /**
   * Model value.
   */
  readonly value: WritableSignal<Readonly<TValue>> = composeSignal({
    get: () => this.control()(),
    set: (value) => this.control().set(value),
  });

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
      if (!this.enabled()) {
        return [] as SignalValidatorResults<TValidators>;
      }

      const validators = this.validators();
      if (validators.length === 0) {
        return [] as SignalValidatorResults<TValidators>;
      }

      const value = this.value();
      const errors: SignalValidationResult<any>[] = [];

      for (const validator of validators) {
        if (!validator.validate(value)) {
          errors.push({ control: this as any, key: validator.key, config: validator.config });
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
  readonly status: Signal<SignalControlStatus> = computed((): SignalControlStatus => {
    if (this.disabled()) {
      return 'DISABLED';
    } else if (this.errors().length > 0) {
      return 'INVALID';
    } else {
      return 'VALID';
    }
  });

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
   * TODO: Remove
   */
  markAsPristine(): void {
    this.#pristine.set(true);
  }

  /**
   * Marks the control as dirty. A control becomes dirty when the control's value is changed through the UI; compare markAsTouched.
   * TODO: Remove
   */
  markAsDirty(): void {
    this.#pristine.set(false);
  }

  readonly #touched: WritableSignal<boolean> = signal(false);

  /**
   * A control is marked touched once the user has triggered a blur event on it.
   */
  readonly touched: Signal<boolean> = this.#touched.asReadonly();

  /**
   * A control is untouched if the user has not yet triggered a blur event on it.
   */
  readonly untouched: Signal<boolean> = computed(() => !this.touched());

  /**
   * Marks the control as touched. A control is touched by focus and blur events that do not change the value.
   * TODO: Remove
   */
  markAsTouched(): void {
    this.#touched.set(true);
  }

  /**
   * Marks the control as untouched.
   * TODO: Remove
   */
  markAsUntouched(): void {
    this.#touched.set(false);
  }

  /**
   * Sync value and disabled statuses.
   * @internal
   */
  protected readonly syncDisabled = effect((cleanup) => {
    const disabledInterceptor = interceptSignal(this.disabled, {
      onSet: (disabled) => {
        if (disabled) {
          this.control().set(undefined as any);
        }
      },
    });

    const valueInterceptor = interceptSignal(this.control(), {
      onSet: (value) => {
        if (value !== undefined) {
          this.disabled.set(false);
        }
      },
    });

    cleanup(() => {
      disabledInterceptor.restore();
      valueInterceptor.restore();
    });
  });

  /**
   * @internal
   */
  protected readonly disabledAttribute = computed(() => (this.disabled() ? '' : null));

  /**
   * Class list to style the input.
   * @internal
   */
  protected readonly classList: Signal<{ [x: string]: boolean }> = computed(() => ({
    [this.statusClasses.valid]: this.valid(),
    [this.statusClasses.invalid]: this.invalid(),
    [this.statusClasses.pristine]: this.pristine(),
    [this.statusClasses.dirty]: this.dirty(),
    [this.statusClasses.touched]: this.touched(),
    [this.statusClasses.untouched]: this.untouched(),
    [this.statusClasses.disabled]: this.disabled(),
  }));
}
