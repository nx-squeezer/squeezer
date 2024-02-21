import { Directive, WritableSignal, input, untracked } from '@angular/core';

import { SignalControlContainer } from './signal-control-container';
import { selectObjectProperty } from '../signals/select-object-property';

/**
 * Form group directive.
 */
@Directive({
  selector: `[ngxFormGroup]`,
  standalone: true,
  exportAs: 'ngxFormGroup',
})
export class SignalFormGroupDirective<T extends object> extends SignalControlContainer<T> {
  /**
   * Model.
   */
  override readonly control = input.required<WritableSignal<Readonly<T>>>({ alias: 'ngxFormGroup' });

  /**
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof T>(key: K): WritableSignal<Readonly<T[K]>> {
    return this.controlSignalsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof T>(key: K): WritableSignal<Readonly<T[K]>> {
    const sourceSignal = untracked(() => this.control());
    const controlSignal = selectObjectProperty(sourceSignal, key);
    this.controlSignalsMap[key] = this.brandSignal(controlSignal, key);
    return controlSignal;
  }
}
