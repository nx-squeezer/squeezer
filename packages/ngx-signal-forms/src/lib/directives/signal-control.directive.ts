import {
  Directive,
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
  Signal,
  WritableSignal,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { DisabledType, EnabledType } from '../models/disabled-type';
import { SignalControlStatus } from '../models/signal-control-status';
import { SignalControlStatusClasses } from '../models/signal-control-status-classes';
import {
  SignalValidationResult,
  SignalValidator,
  SignalValidatorKeys,
  SignalValidatorResultByKey,
  SignalValidatorResults,
} from '../models/signal-validator';
import { SignalControlContainerRegistry } from '../services/signal-control-container-registry.service';
import { modelFrom } from '../signals/composed-model';
import { negatedSignal } from '../signals/negated-signal';
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
  /**
   * @internal
   */
  protected readonly registry = inject(SignalControlContainerRegistry);

  private readonly statusClasses: SignalControlStatusClasses = inject(SIGNAL_CONTROL_STATUS_CLASSES);

  #parent: SignalControlContainer<any> | null = null;
  #key: string | number | null = null;

  /**
   * @internal
   */
  protected inferControlKey = <T>(value: T): T => {
    this.#parent = this.registry.controlContainer;
    this.#key = this.registry.key;
    this.registry.controlContainer = null;
    this.registry.key = null;
    return value;
  };

  /**
   * Input model.
   */
  readonly model: InputSignal<Readonly<TValue>> = input.required<Readonly<TValue>, Readonly<TValue>>({
    alias: 'ngxControl',
    transform: this.inferControlKey,
  });

  /**
   * Output model.
   */
  readonly modelChange: OutputEmitterRef<Readonly<TValue>> = output<Readonly<TValue>>({ alias: 'ngxControlChange' });

  /**
   * Control value.
   */
  readonly value: WritableSignal<Readonly<TValue>> = modelFrom({
    input: () => this.model,
    output: () => this.modelChange,
  });

  /**
   * Disabled controls are exempt from validation checks and are not included in the aggregate value of their ancestor controls.
   */
  readonly disabled: WritableSignal<DisabledType<TValue>> = model(false as DisabledType<TValue>, {
    alias: 'ngxDisabled',
  });

  /**
   * Indicates if the control is not disabled.
   */
  readonly enabled: WritableSignal<EnabledType<TValue>> = negatedSignal(() => this.disabled) as WritableSignal<
    EnabledType<TValue>
  >;

  /**
   * When the control is a child of a control container, this value exposes a reference to the parent.
   */
  get parent(): SignalControlContainer<any> | null {
    return this.#parent;
  }

  /**
   * Key of the control when it is a child
   */
  get key(): string | number | null {
    return this.#key;
  }

  /**
   * Default key when the control is not a child of a control container.
   */
  readonly defaultKey: string = 'control';

  /**
   * When the control is a child of a control container, this reactive value exposes its relative path.
   * For standalone controls it returns the default key.
   */
  readonly path: Signal<string | null> = computed((): string | null => {
    const parentPath = this.parent?.path();
    const key = this.key;
    return parentPath != null && key != null ? `${parentPath}.${key}` : this.defaultKey;
  });

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

  private readonly errorMap: Signal<Map<string, SignalValidationResult<any>>> = computed(
    () => new Map<string, SignalValidationResult<any>>(this.errors().map((error) => [error.key, error]))
  );

  /**
   * Reactive value of a specific error.
   * TODO: convert into proxy
   */
  error<K extends SignalValidatorKeys<TValidators>>(
    errorKey: K
  ): SignalValidatorResultByKey<TValidators, K> | undefined {
    return this.errorMap().get(errorKey) as any;
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

  /**
   * A control is pristine if the user has not yet changed the value in the UI.
   */
  readonly pristine: WritableSignal<boolean> = signal(true);

  /**
   * A control is dirty if the user has changed the value in the UI.
   */
  readonly dirty: WritableSignal<boolean> = negatedSignal(() => this.pristine);

  /**
   * A control is marked touched once the user has triggered a blur event on it.
   */
  readonly touched: WritableSignal<boolean> = signal(false);

  /**
   * A control is untouched if the user has not yet triggered a blur event on it.
   */
  readonly untouched: WritableSignal<boolean> = negatedSignal(() => this.touched);

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

  /**
   * @internal
   */
  protected readonly watchValueChanges = effect(
    () => {
      // Only controls need to sync the disabled status
      if (this.defaultKey !== 'control') {
        return;
      }

      if (this.value() !== undefined) {
        this.disabled.set(false);
      }
    },
    { allowSignalWrites: true }
  );

  /**
   * @internal
   */
  protected readonly watchDisabledChanges = effect(
    () => {
      // Only controls need to sync the disabled status
      if (this.defaultKey !== 'control') {
        return;
      }

      if (this.disabled()) {
        this.value.set(undefined as any);
      }
    },
    { allowSignalWrites: true }
  );

  /**
   * @internal
   */
  protected readonly registerControl = effect(
    (cleanup) => {
      const parent = this.parent;
      const key = this.key;

      if (parent == null || key == null) {
        return;
      }

      parent.addControl(key, this as unknown as SignalControlDirective<any>);
      cleanup(() => parent.removeControl(key));
    },
    { allowSignalWrites: true }
  );
}
