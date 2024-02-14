import { Directive, Input, WritableSignal, computed, untracked } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { toWritable } from '../utils/to-writable';

/**
 * @internal
 */
type SignalFormGroupControls<T extends object> = {
  [K in keyof T]?: WritableSignal<T[K]>;
};

/**
 * Form group directive.
 */
@Directive({
  selector: `[ngxFormGroup]`,
  standalone: true,
  exportAs: 'ngxFormGroup',
})
export class SignalFormGroupDirective<T extends object> extends SignalControlDirective<T> {
  private readonly formGroupControlsMap: SignalFormGroupControls<T> = {};

  /**
   * Model.
   */
  @Input({ alias: 'ngxFormGroup', required: true }) override control!: WritableSignal<T>;

  /**
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof T>(key: K): WritableSignal<T[K]> {
    return this.formGroupControlsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof T>(key: K): WritableSignal<T[K]> {
    const control = toWritable(
      computed(() => this.control()[key]),
      (value: T[K]) => this.updateFormGroupField(key, value)
    );

    this.formGroupControlsMap[key] = control;
    return control;
  }

  private updateFormGroupField<K extends keyof T>(key: K, value: T[K]) {
    const groupValue = untracked(() => this.control());

    if (!Object.is(groupValue[key], value)) {
      this.control.set({ ...groupValue, [key]: value });
    }
  }
}
