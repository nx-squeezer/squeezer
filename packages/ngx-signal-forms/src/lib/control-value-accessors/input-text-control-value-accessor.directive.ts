import { Directive, WritableSignal, input } from '@angular/core';

import { SignalControlValueAccessor } from '../directives/signal-control-value-accessor';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxControl][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'control().set($event.target.value)',
    '[value]': 'value()',
  },
  exportAs: 'ngxControlValueAccessor',
})
export class InputTextControlValueAccessorDirective extends SignalControlValueAccessor<string, HTMLInputElement> {
  /**
   * Model.
   */
  readonly control = input.required<WritableSignal<string>>({ alias: 'ngxControl' });
}
