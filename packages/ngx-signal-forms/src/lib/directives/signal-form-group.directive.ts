import { Directive, InputSignal, WritableSignal, forwardRef, input, untracked } from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { AbstractSignalControlContainer } from '../models/abstract-signal-control-container';
import { SignalValidator } from '../models/signal-validator';
import { selectObjectProperty } from '../signals/select-object-property';

/**
 * Form group directive.
 */
@Directive({
  selector: `[ngxFormGroup]`,
  standalone: true,
  providers: [{ provide: AbstractSignalControlContainer, useExisting: forwardRef(() => SignalFormGroupDirective) }],
  exportAs: 'ngxFormGroup',
})
export class SignalFormGroupDirective<
  TValue extends object,
  TValidators extends SignalValidator<TValue, string>[] = [],
> extends SignalControlContainer<TValue, TValidators> {
  /**
   * Model.
   */
  override readonly control: InputSignal<WritableSignal<Readonly<TValue>>> = input.required<
    WritableSignal<Readonly<TValue>>,
    WritableSignal<Readonly<TValue>>
  >({ alias: 'ngxFormGroup', transform: this.inferControlKey });

  /**
   * Default key when the control is not a child of a control container.
   */
  override readonly defaultKey: string = 'form-group';

  /**
   * Returns a signal with the value of the form group at a given key.
   */
  get<K extends keyof TValue>(key: K): WritableSignal<Readonly<TValue[K]>> {
    this.activeKey = key as string | number;
    return this.controlSignalsMap[key] ?? this.createControlSignal(key);
  }

  private createControlSignal<K extends keyof TValue>(key: K): WritableSignal<Readonly<TValue[K]>> {
    const sourceSignal = untracked(() => this.control());
    const controlSignal = selectObjectProperty(sourceSignal, key);
    this.controlSignalsMap[key] = controlSignal;
    return controlSignal;
  }
}
