import { Directive, ElementRef, WritableSignal, effect, inject, input } from '@angular/core';

import { SignalControlValueAccessor } from '../../models/control-value-accessor';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxControl][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'control().set($event.target.value)',
  },
  exportAs: 'ngxControlValueAccessor',
})
export class InputTextControlValueAccessorDirective implements SignalControlValueAccessor<string> {
  private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);

  /**
   * Model.
   */
  readonly control = input.required<WritableSignal<string>>({ alias: 'ngxControl' });

  /**
   * @internal
   */
  protected readonly updateValue = effect(() => {
    const control = this.control();
    this.elementRef.nativeElement.value = control();
  });
}
