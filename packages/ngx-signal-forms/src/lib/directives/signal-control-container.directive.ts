import { DestroyRef, Signal, WritableSignal, computed, inject } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { SignalControlStatus } from '../models/signal-control-status';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { MapSignal } from '../signals/map-signal';

/**
 * Abstract class that represents a signal control container.
 */
export abstract class SignalControlContainer<T extends object> extends SignalControlDirective<T> {
  /**
   * Map of signals corresponding to the child controls.
   */
  protected readonly controlSignalsMap: { [K in keyof T]?: WritableSignal<Readonly<T[K]>> } = {};

  readonly #controlDirectivesMap = new MapSignal<keyof T, SignalControlDirective<T[keyof T]>>();

  /**
   * The validation status of the form group and its child controls.
   */
  override readonly status: Signal<SignalControlStatus> = computed(() => {
    const errors = this.errors();

    // If the form group is invalid, there is no need to keep checking
    if (errors != null) {
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
   * Adds a control to the container.
   */
  addControl<K extends keyof T>(key: K, signalControlDirective: SignalControlDirective<T[K]>) {
    this.#controlDirectivesMap.set(key, signalControlDirective as any);
  }

  /**
   * Removes a control from the container.
   */
  removeControl<K extends keyof T>(key: K) {
    this.#controlDirectivesMap.delete(key);
  }

  /**
   * Adds hidden properties to a signal to hold a reference to the control container.
   */
  protected brandSignal<K extends keyof T, S extends WritableSignal<Readonly<T[K]>>>(writableSignal: S, key: K): S {
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
