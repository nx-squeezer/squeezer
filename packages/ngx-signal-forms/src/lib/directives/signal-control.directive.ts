import { Directive, WritableSignal, effect, input } from '@angular/core';

import { isControl } from '../models/control-signal';
import { ValidationErrors } from '../models/validation-errors';
import { Validator } from '../models/validator';

/**
 * Control directive.
 */
@Directive({
  selector: `[ngxControl]`,
  standalone: true,
  exportAs: 'ngxControl',
})
export class SignalControlDirective<T, V extends ValidationErrors = {}> {
  /**
   * Model.
   */
  readonly control = input.required<WritableSignal<T>>({ alias: 'ngxControl' });

  /**
   * Validators.
   */
  readonly validators = input<readonly Validator<T, V>[]>([]);

  /**
   * @internal
   */
  protected setValidators = effect(
    (onCleanup) => {
      const control = this.control();
      if (!isControl(control)) {
        return;
      }

      control.validators.set(this.validators());

      onCleanup(() => control.validators.set([]));
    },
    { allowSignalWrites: true }
  );
}
