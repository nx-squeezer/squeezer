import {
  computed,
  effect,
  EffectRef,
  inject,
  Injector,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';

import { SignalValidator, SignalValidatorCombinedResults } from '../models/signal-validator';

export interface SignalControlOptions<TValue, TValidators extends SignalValidator<TValue, string, any>[] = []> {
  /**
   * Validators.
   */
  validators?: TValidators;
}

export class SignalControl<TValue, TValidators extends SignalValidator<TValue, string, any>[] = []> {
  constructor(
    private readonly initialValue: TValue,
    private readonly options?: SignalControlOptions<TValidators>
  ) {}

  private readonly injector = inject(Injector);

  /**
   * Control value.
   */
  readonly value: WritableSignal<Readonly<TValue>> = signal(this.initialValue);

  /**
   * Validators.
   */
  readonly validators: WritableSignal<TValidators> = signal(
    (this.options?.validators ?? ([] as unknown)) as TValidators
  );

  /**
   * Reactive value that exposes active validation errors by key.
   */
  readonly errors: Signal<Readonly<SignalValidatorCombinedResults<TValidators>>> = computed(
    (): Readonly<SignalValidatorCombinedResults<TValidators>> => {
      // TODO: consider enabled state

      const validators = this.validators();
      if (validators.length === 0) {
        return {};
      }

      const value = this.value();
      const errors: SignalValidatorCombinedResults<TValidators> = {};

      for (const validator of validators) {
        if (!validator.validate(value)) {
          (errors as any)[validator.key] = { control: this as any, key: validator.key, config: validator.config };
        }
      }

      return errors;
    }
  );

  bindValue(valueSignal: WritableSignal<TValue>, options?: { initialValue: TValue }): EffectRef {
    // TODO: abstract
    let controlToValueEffectRef: EffectRef;
    let valueToControlEffectRef: EffectRef;

    untracked(() => {
      controlToValueEffectRef = effect(
        () => {
          this.value.set(valueSignal());
        },
        { allowSignalWrites: true, injector: this.injector }
      );

      valueToControlEffectRef = effect(
        () => {
          valueSignal.set(this.value());
        },
        { allowSignalWrites: true, injector: this.injector }
      );

      if (options != null) {
        valueSignal.set(options.initialValue);
        this.value.set(options.initialValue);
      }
    });

    return {
      destroy() {
        controlToValueEffectRef.destroy();
        valueToControlEffectRef.destroy();
      },
    };
  }
}

export function control<TValue>(initialValue: TValue): SignalControl<TValue> {
  return new SignalControl(initialValue);
}
