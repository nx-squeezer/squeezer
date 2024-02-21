import { Directive, WritableSignal, input, untracked } from '@angular/core';

import { SignalControlContainer } from './signal-control-container';
import { SIGNAL_CONTROL_CONTAINER, SIGNAL_CONTROL_KEY } from '../models/symbols';
import { toWritable } from '../utils/to-writable';

/**
 * @internal
 */
type SignalFormGroupControls<T extends object> = {
  [K in keyof T]?: WritableSignal<Readonly<T[K]>>;
};

/**
 * Form group directive.
 */
@Directive({
  selector: `[ngxFormGroup]`,
  standalone: true,
  exportAs: 'ngxFormGroup',
})
export class SignalFormGroupDirective<T extends object> extends SignalControlContainer<T> {
  private readonly formGroupControlsMap: SignalFormGroupControls<T> = {};

  /**
   * Model.
   */
  override readonly control = input.required<WritableSignal<Readonly<T>>>({ alias: 'ngxFormGroup' });

  /**
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof T>(key: K): WritableSignal<Readonly<T[K]>> {
    return this.formGroupControlsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof T>(key: K): WritableSignal<Readonly<T[K]>> {
    const writableSignal = toWritable(
      () => this.control()()[key],
      (value: T[K]) => this.updateFormGroupField(key, value)
    );
    (writableSignal as any)[SIGNAL_CONTROL_CONTAINER] = this;
    (writableSignal as any)[SIGNAL_CONTROL_KEY] = key;

    this.formGroupControlsMap[key] = writableSignal;
    return writableSignal;
  }

  // TODO: refactor into selectObjectProperty
  private updateFormGroupField<K extends keyof T>(key: K, value: T[K]) {
    const ngxControl = untracked(() => this.control());
    const groupValue = untracked(() => ngxControl());

    if (!Object.is(groupValue[key], value)) {
      ngxControl.set({ ...groupValue, [key]: value });
    }
  }
}
