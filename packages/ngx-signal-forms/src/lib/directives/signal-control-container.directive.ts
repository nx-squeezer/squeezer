import { DestroyRef, Signal, WritableSignal, computed, inject } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { SignalControlStatus } from '../models/signal-control-status';
import { SignalValidator } from '../models/signal-validator';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { MapSignal } from '../signals/map-signal';

/**
 * Abstract class that represents a signal control container.
 */
export abstract class SignalControlContainer<
  TValue extends object,
  TValidators extends SignalValidator<TValue, string>[] = []
> extends SignalControlDirective<TValue, TValidators> {
  /**
   * Map of signals corresponding to the child controls.
   */
  protected readonly controlSignalsMap: { [K in keyof TValue]?: WritableSignal<Readonly<TValue[K]>> } = {};

  readonly #controlDirectivesMap = new MapSignal<keyof TValue, SignalControlDirective<TValue[keyof TValue]>>();

  /**
   * The validation status of the form group and its child controls.
   */
  override readonly status: Signal<SignalControlStatus> = computed(() => {
    // If the form group is invalid, there is no need to keep checking
    if (this.errors().length > 0) {
      return 'INVALID';
    }

    // Otherwise, check the status of all child controls, and as soon as a child control is invalid, return
    const controlDirectiveStatuses = this.#controlDirectivesMap.values().map(({ status }) => status());
    return controlDirectiveStatuses.some((status) => status === 'INVALID') ? 'INVALID' : 'VALID';
  });

  /**
   * A control is pristine if the user has not yet changed the value in the UI in any of its child controls.
   */
  override pristine: Signal<boolean> = computed(() => {
    return !this.#controlDirectivesMap.values().some((directive) => directive.dirty());
  });

  /**
   * Marks all the child controls as pristine.
   */
  override markAsPristine(): void {
    this.#controlDirectivesMap.values().forEach((directive) => directive.markAsPristine());
  }

  /**
   * Marks all the child controls as dirty.
   */
  override markAsDirty(): void {
    this.#controlDirectivesMap.values().forEach((directive) => directive.markAsDirty());
  }

  /**
   * A control is marked touched once the user has triggered a blur event on it or in any of its child controls.
   */
  override touched: Signal<boolean> = computed(() => {
    return this.#controlDirectivesMap.values().some((directive) => directive.touched());
  });

  /**
   * Marks all the child controls as touched.
   */
  override markAsTouched(): void {
    this.#controlDirectivesMap.values().forEach((directive) => directive.markAsTouched());
  }

  /**
   * Marks all the child controls as untouched.
   */
  override markAsUntouched(): void {
    this.#controlDirectivesMap.values().forEach((directive) => directive.markAsUntouched());
  }

  /**
   * Adds a control to the container.
   */
  addControl<K extends keyof TValue>(key: K, signalControlDirective: SignalControlDirective<TValue[K]>): void {
    this.#controlDirectivesMap.set(key, signalControlDirective as any);
  }

  /**
   * Removes a control from the container.
   */
  removeControl<K extends keyof TValue>(key: K): void {
    this.#controlDirectivesMap.delete(key);
  }

  /**
   * Adds hidden properties to a signal to hold a reference to the control container.
   */
  protected brandSignal<K extends keyof TValue, S extends WritableSignal<Readonly<TValue[K]>>>(
    writableSignal: S,
    key: K
  ): S {
    const signal: any = writableSignal;
    signal[SIGNAL_CONTROL_CONTAINER] = this;
    signal[SIGNAL_CONTROL_KEY] = key;
    return signal;
  }

  /**
   * Cleans up any references to child controls.
   */
  protected readonly cleanup = inject(DestroyRef).onDestroy(() => this.#controlDirectivesMap.clear());
}
