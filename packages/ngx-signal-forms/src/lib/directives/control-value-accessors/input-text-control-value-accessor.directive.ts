import { Directive, ElementRef, Input, WritableSignal, effect, inject } from '@angular/core';

import { SignalControlValueAccessor } from '../../models/control-value-accessor';

/**
 * Control value accessor for text inputs.
 */
@Directive({
  selector: `input[type="text"][ngxControl][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'control.set($event.target.value)',
  },
  exportAs: 'ngxControlValueAccessor',
})
export class InputTextControlValueAccessorDirective implements SignalControlValueAccessor<string> {
  private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);

  /**
   * Model.
   */
  @Input({ alias: 'ngxControl', required: true }) control!: WritableSignal<string>;

  /**
   * @internal
   */
  protected readonly updateValue = effect(() => {
    this.elementRef.nativeElement.value = this.control();
  });
}
