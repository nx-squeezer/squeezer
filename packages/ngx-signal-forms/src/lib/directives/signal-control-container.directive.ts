import { Signal, WritableSignal, computed, signal, untracked } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { SignalControlStatus } from '../models/signal-control-status';
import { SignalValidator } from '../models/signal-validator';
import { modelFrom } from '../signals/composed-model';
import { composedSignal } from '../signals/composed-signal';

/**
 * Abstract class that represents a signal control container.
 */
export abstract class SignalControlContainer<
  TValue extends object,
  TValidators extends SignalValidator<TValue, string>[] = [],
> extends SignalControlDirective<TValue, TValidators> {
  readonly #controls: WritableSignal<{ [key in keyof TValue]?: SignalControlDirective<TValue[key]> }> = signal<{
    [key in keyof TValue]?: SignalControlDirective<TValue[key]>;
  }>({});

  /**
   * Exposes child controls by key.
   */
  readonly controls: Signal<{ [key in keyof TValue]?: SignalControlDirective<TValue[key], []> }> =
    this.#controls.asReadonly();

  private readonly controlDirectives: Signal<SignalControlDirective<TValue[keyof TValue]>[]> = computed(() => {
    return [...Object.values(this.controls())] as SignalControlDirective<TValue[keyof TValue]>[];
  });

  /**
   * Exposes child signals for controls.
   */
  override readonly value: WritableSignal<TValue> & { [K in keyof TValue]: WritableSignal<Readonly<TValue[K]>> } =
    new Proxy<WritableSignal<TValue> & { [K in keyof TValue]: WritableSignal<Readonly<TValue[K]>> }>(
      modelFrom({
        input: () => this.model,
        output: () => this.modelChange,
      }) as any,
      {
        get: (target, key: string) => {
          if (key in target) {
            return target[key as keyof TValue];
          }

          const keyedSignal = composedSignal({
            get: () => {
              this.registry.key = key as string | number;
              this.registry.controlContainer = this as unknown as SignalControlContainer<any>;
              return this.value()[key as keyof TValue];
            },
            set: (value) => {
              const objectValue = untracked(() => this.value());
              if (!Object.is(objectValue[key as keyof TValue], value)) {
                this.value.set({ ...objectValue, [key]: value });
              }
            },
          });

          Object.defineProperty(target, key, { value: keyedSignal, writable: false, configurable: false });
          return keyedSignal;
        },
      }
    );

  /**
   * The validation status of the form group and its child controls.
   */
  override readonly status: Signal<SignalControlStatus> = computed(() => {
    // If the form group is invalid, there is no need to keep checking
    if (this.errors().length > 0) {
      return 'INVALID';
    }

    // Otherwise, check the status of all child controls, and as soon as a child control is invalid, return
    const controlDirectiveStatuses = this.controlDirectives().map(({ status }) => status());
    return controlDirectiveStatuses.some((status) => status === 'INVALID') ? 'INVALID' : 'VALID';
  });

  /**
   * A control container can't be disabled, but when set to false it will change the disabled status of its child controls.
   */
  override disabled: WritableSignal<false> = composedSignal({
    get: () => false,
    set: () => this.controlDirectives().forEach((directive) => directive.disabled.set(false)),
  });

  /**
   * A control container is pristine if the user has not yet changed the value in the UI in any of its child controls.
   */
  override pristine: WritableSignal<boolean> = composedSignal({
    get: () => this.controlDirectives().every((directive) => directive.pristine()),
    set: (value) => this.controlDirectives().forEach((directive) => directive.pristine.set(value)),
  });

  /**
   * A control container is marked touched once the user has triggered a blur event on it or in any of its child controls.
   */
  override touched: WritableSignal<boolean> = composedSignal({
    get: () => this.controlDirectives().some((directive) => directive.touched()),
    set: (value) => this.controlDirectives().forEach((directive) => directive.touched.set(value)),
  });

  /**
   * Adds a control to the container.
   */
  addControl<K extends keyof TValue>(key: K, signalControlDirective: SignalControlDirective<TValue[K]>): void {
    const controls = { ...untracked(() => this.controls()) };
    controls[key] = signalControlDirective;
    this.#controls.set(controls);
  }

  /**
   * Removes a control from the container.
   */
  removeControl<K extends keyof TValue>(key: K): void {
    const controls = { ...untracked(() => this.controls()) };
    delete controls[key];
    this.#controls.set(controls);
  }
}
