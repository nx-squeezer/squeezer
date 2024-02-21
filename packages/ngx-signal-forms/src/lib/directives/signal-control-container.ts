import { DestroyRef, computed, inject } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { MapSignal } from '../signals/map-signal';

/**
 * Abstract class that represents a signal control container.
 */
export abstract class SignalControlContainer<T extends object> extends SignalControlDirective<T> {
  /**
   * @internal
   */
  private readonly controlDirectivesMap = new MapSignal<T, SignalControlDirective<unknown>>();

  /**
   * The validation status of the form group and its child controls.
   */
  override readonly status = computed(() => {
    const errors = this.errors();

    // If the form group is invalid, there is no need to keep checking
    if (errors != null) {
      return 'INVALID';
    }

    // Otherwise, check the status of all child controls, and as soon as a child control is invalid, return
    const controlDirectiveStatuses = this.controlDirectivesMap.values().map(({ status }) => status());
    if (controlDirectiveStatuses.some((status) => status === 'INVALID')) {
      return 'INVALID';
    }

    return 'VALID';
  });

  /**
   * Adds a control to the container.
   */
  addControl<K extends keyof T>(key: K, signalControlDirective: SignalControlDirective<T[K]>) {
    this.controlDirectivesMap.set(key, signalControlDirective as SignalControlDirective<unknown>);
  }

  /**
   * Removes a control from the container.
   */
  removeControl<K extends keyof T>(key: K) {
    this.controlDirectivesMap.delete(key);
  }

  /**
   * @internal
   */
  protected readonly cleanup = inject(DestroyRef).onDestroy(() => this.controlDirectivesMap.clear());
}
