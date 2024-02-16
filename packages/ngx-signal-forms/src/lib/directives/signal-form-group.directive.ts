import { Directive, WritableSignal, computed, input, untracked } from '@angular/core';

import { SignalControlDirective, getSignalControlDirective } from './signal-control.directive';
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
  override readonly control = input.required<WritableSignal<T>>({ alias: 'ngxFormGroup' });

  /**
   * The validation status of the form group and its child controls.
   */
  override readonly status = computed(() => {
    const errors = this.errors();

    // If the form group is invalid, there is no need to keep checking
    if (errors != null) {
      return 'INVALID';
    }

    // Otherwise, check the status of all child controls
    // TODO: avoid using fluent API for performance
    const childSignalControlDirectiveStatuses = (Object.values(this.formGroupControlsMap) as WritableSignal<unknown>[])
      .map((signal) => getSignalControlDirective(signal))
      .filter((directive): directive is SignalControlDirective<unknown> => directive != null)
      .map((directive) => directive.status());

    for (const status of childSignalControlDirectiveStatuses) {
      // As soon as a child control is invalid, return
      if (status === 'INVALID') {
        return 'INVALID';
      }
    }

    return 'VALID';
  });

  /**
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof T>(key: K): WritableSignal<T[K]> {
    return this.formGroupControlsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof T>(key: K): WritableSignal<T[K]> {
    const writableSignal = toWritable(
      () => this.control()()[key],
      (value: T[K]) => this.updateFormGroupField(key, value)
    );

    this.formGroupControlsMap[key] = writableSignal;
    return writableSignal;
  }

  private updateFormGroupField<K extends keyof T>(key: K, value: T[K]) {
    const ngxControl = untracked(() => this.control());
    const groupValue = untracked(() => ngxControl());

    if (!Object.is(groupValue[key], value)) {
      ngxControl.set({ ...groupValue, [key]: value });
    }
  }
}
