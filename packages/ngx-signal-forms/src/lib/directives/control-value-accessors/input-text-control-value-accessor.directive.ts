import { Directive, Input } from '@angular/core';

import { SignalControlValueAccessor } from '../../models/control-value-accessor';
import { SignalControl } from '../../models/signal-control';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'control.set($event.target.value)',
    '[value]': 'control()',
  },
})
export class InputTextControlValueAccessorDirective implements SignalControlValueAccessor<string> {
  /**
   * Model control.
   */
  @Input({ alias: 'ngxTextInput', required: true }) control!: SignalControl<string>;
}
