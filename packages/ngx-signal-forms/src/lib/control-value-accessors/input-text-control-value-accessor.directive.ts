import { Directive, forwardRef, model } from '@angular/core';

import { SignalControlValueAccessor } from '../directives/signal-control-value-accessor.directive';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxControl][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'updateValue($event.target.value)',
    '(blur)': 'markAsTouched()',
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
  readonly value = model.required<string>({ alias: 'ngxControl' });
}
