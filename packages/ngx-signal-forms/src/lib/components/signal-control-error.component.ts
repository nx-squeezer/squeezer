import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';

import { SignalControlErrorDirective } from '../directives/signal-control-error.directive';
import { SignalValidationResult } from '../models/signal-validator';

/**
 * Component to display form errors.
 */
@Component({
  selector: 'ngx-control-error',
  template: '<ng-content/>',
  host: {
    '[id]': 'id()',
  },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalControlErrorComponent {
  private readonly controlErrorDirective = inject(SignalControlErrorDirective, { skipSelf: true, host: true });

  /**
   * @internal
   */
  protected readonly id = computed(() => {
    const error = this.controlErrorDirective.ngxError();
    if (error == null) {
      return;
    }
    return `ngx-control-error.${error.control.path()}.${error.key}`;
  });

  /**
   * @internal
   */
  protected readonly registerDescription = effect(
    (cleanup) => {
      const id = this.id() as string;
      const error = this.controlErrorDirective.ngxError() as SignalValidationResult<string, unknown>;

      error.control.addErrorDescription(id);
      cleanup(() => error.control.removeErrorDescription(id));
    },
    { allowSignalWrites: true }
  );
}
