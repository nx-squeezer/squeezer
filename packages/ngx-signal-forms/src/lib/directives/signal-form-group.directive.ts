import { Directive, InputSignal, OutputEmitterRef, input, output } from '@angular/core';

import { SignalControlContainer } from './signal-control-container.directive';
import { SignalValidator } from '../models/signal-validator';

/**
 * Form group directive.
 */
@Directive({
  selector: `[ngxFormGroup]`,
  standalone: true,
  exportAs: 'ngxFormGroup',
})
export class SignalFormGroupDirective<
  TValue extends object,
  TValidators extends SignalValidator<TValue, string>[] = [],
> extends SignalControlContainer<TValue, TValidators> {
  /**
   * Input value.
   */
  override readonly value: InputSignal<Readonly<TValue>> = input.required<Readonly<TValue>, Readonly<TValue>>({
    alias: 'ngxFormGroup',
    transform: this.inferControlKey,
  });

  /**
   * Output value.
   */
  override readonly valueChange: OutputEmitterRef<Readonly<TValue>> = output<Readonly<TValue>>({
    alias: 'ngxFormGroupChange',
  });

  /**
   * Default key when the control is not a child of a control container.
   */
  override readonly defaultKey: string = 'form-group';
}
