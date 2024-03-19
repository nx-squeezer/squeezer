import { DestroyRef, Signal, WritableSignal, computed, inject } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { AbstractSignalControlContainer } from '../models/abstract-signal-control-container';
import { SignalControlStatus } from '../models/signal-control-status';
import { SignalValidator } from '../models/signal-validator';
import { composedSignal } from '../signals/composed-signal';
import { MapSignal } from '../signals/map-signal';

// TODO: expose child controls

/**
 * Abstract class that represents a signal control container.
 */
export abstract class SignalControlContainer<
    TValue extends object,
    TValidators extends SignalValidator<TValue, string>[] = [],
  >
  extends SignalControlDirective<TValue, TValidators>
  implements AbstractSignalControlContainer<TValue>
{
  /**
   * Map of signals corresponding to the child controls.
   */
  protected readonly controlSignalsMap: { [K in keyof TValue]?: WritableSignal<Readonly<TValue[K]>> } = {};

  private readonly controlDirectivesMap = new MapSignal<keyof TValue, SignalControlDirective<TValue[keyof TValue]>>();

  /**
   * The validation status of the form group and its child controls.
   */
  override readonly status: Signal<SignalControlStatus> = computed(() => {
    // If the form group is invalid, there is no need to keep checking
    if (this.errors().length > 0) {
      return 'INVALID';
    }

    // Otherwise, check the status of all child controls, and as soon as a child control is invalid, return
    const controlDirectiveStatuses = this.controlDirectivesMap.values().map(({ status }) => status());
    return controlDirectiveStatuses.some((status) => status === 'INVALID') ? 'INVALID' : 'VALID';
  });

  /**
   * A control container can't be disabled, but when set to false it will change the disabled status of its child controls.
   */
  override disabled: WritableSignal<false> = composedSignal({
    get: () => false,
    set: () => this.controlDirectivesMap.values().forEach((directive) => directive.disabled.set(false)),
  });

  /**
   * A control container is pristine if the user has not yet changed the value in the UI in any of its child controls.
   */
  override pristine: WritableSignal<boolean> = composedSignal({
    get: () => this.controlDirectivesMap.values().every((directive) => directive.pristine()),
    set: (value) => this.controlDirectivesMap.values().forEach((directive) => directive.pristine.set(value)),
  });

  /**
   * A control container is marked touched once the user has triggered a blur event on it or in any of its child controls.
   */
  override touched: WritableSignal<boolean> = composedSignal({
    get: () => this.controlDirectivesMap.values().some((directive) => directive.touched()),
    set: (value) => this.controlDirectivesMap.values().forEach((directive) => directive.touched.set(value)),
  });

  /**
   * @internal
   */
  activeKey: string | number | null = null;

  /**
   * Adds a control to the container.
   */
  addControl<K extends keyof TValue>(key: K, signalControlDirective: SignalControlDirective<TValue[K]>): void {
    this.controlDirectivesMap.set(key, signalControlDirective as any);
  }

  /**
   * Removes a control from the container.
   */
  removeControl<K extends keyof TValue>(key: K): void {
    this.controlDirectivesMap.delete(key);
  }

  /**
   * Cleans up any references to child controls.
   */
  protected readonly cleanup = inject(DestroyRef).onDestroy(() => this.controlDirectivesMap.clear());
}
