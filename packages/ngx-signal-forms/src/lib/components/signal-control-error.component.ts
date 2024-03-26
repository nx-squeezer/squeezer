import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';

import { SignalControlErrorDirective } from '../directives/signal-control-error.directive';

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
      const id = this.id();
      const error = this.controlErrorDirective.ngxError();

      if (id == null || error == null) {
        return;
      }

      error.control.addErrorDescription(id);
      cleanup(() => error.control.removeErrorDescription(id));
    },
    { allowSignalWrites: true }
  );
}
