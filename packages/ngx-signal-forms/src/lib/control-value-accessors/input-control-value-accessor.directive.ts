import { Directive, effect, input, model, untracked } from '@angular/core';

import { control, SignalControl } from '../primitives/control';

/**
 * Control value accessor for text inputs. TODO: rename to include text
 */
@Directive({
  selector: `input[type="text"][ngxTextInput]`,
  standalone: true,
  host: {
    '(input)': 'ngxControl().value.set($event.target.value)',
    //'(blur)': 'markAsTouched()',
    '[value]': 'ngxControl().value()',
  },
  exportAs: 'ngxControlValueAccessor',
})
export class InputControlValueAccessorDirective {
  private readonly internalControl = control('');

  /**
   * Model.
   */
  readonly ngxModel = model.required<string>();

  /**
   * Control.
   */
  readonly ngxControl = input<SignalControl<string>>(this.internalControl);

  constructor() {
    // TODO: abstract
    effect((cleanup) => {
      const valueBinding = this.ngxControl().bindValue(this.ngxModel, {
        initialValue: untracked(() =>
          this.ngxControl() === this.internalControl ? this.ngxModel() : this.ngxControl().value()
        ),
      });
      cleanup(() => valueBinding.destroy());
    });
  }
}
