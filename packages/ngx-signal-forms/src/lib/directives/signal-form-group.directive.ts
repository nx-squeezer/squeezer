import { Directive, WritableSignal, input, untracked } from '@angular/core';

import { SignalControlDirective } from './signal-control.directive';
import { ControlSignal, toControl } from '../models/control-signal';
import { toWritable } from '../utils/to-writable';

/**
 * @internal
 */
type SignalFormGroupControls<T extends object> = {
  [K in keyof T]?: ControlSignal<T[K]>;
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
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof T>(key: K): WritableSignal<T[K]> {
    return this.formGroupControlsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof T>(key: K): ControlSignal<T[K]> {
    const writableSignal = toWritable(
      () => this.control()()[key],
      (value: T[K]) => this.updateFormGroupField(key, value)
    );
    const control = toControl(writableSignal);

    this.formGroupControlsMap[key] = control;
    return control;
  }

  private updateFormGroupField<K extends keyof T>(key: K, value: T[K]) {
    const ngxControl = untracked(() => this.control());
    const groupValue = untracked(() => ngxControl());

    if (!Object.is(groupValue[key], value)) {
      ngxControl.set({ ...groupValue, [key]: value });
    }
  }
}
