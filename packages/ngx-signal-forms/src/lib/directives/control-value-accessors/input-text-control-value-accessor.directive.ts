import { Directive, Input, WritableSignal } from '@angular/core';

import { SignalControlValueAccessor } from '../../models/control-value-accessor';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxControl][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'control.set($event.target.value)',
    '[value]': 'control()',
  },
})
export class InputTextControlValueAccessorDirective implements SignalControlValueAccessor<string> {
  /**
   * Model.
   */
  @Input({ alias: 'ngxControl', required: true }) control!: WritableSignal<string>;
}
