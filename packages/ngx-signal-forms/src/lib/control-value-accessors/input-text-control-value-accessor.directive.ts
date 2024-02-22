import { Directive, WritableSignal, forwardRef, input } from '@angular/core';

import { SignalControlValueAccessor } from '../directives/signal-control-value-accessor.directive';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxControl][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'updateValue($event.target.value)',
    '[value]': 'value()',
  },
  providers: [
    { provide: SignalControlValueAccessor, useExisting: forwardRef(() => InputTextControlValueAccessorDirective) },
  ],
  exportAs: 'ngxControlValueAccessor',
})
export class InputTextControlValueAccessorDirective extends SignalControlValueAccessor<string, HTMLInputElement> {
  /**
   * Model.
   */
  readonly control = input.required<WritableSignal<string>>({ alias: 'ngxControl' });
}
