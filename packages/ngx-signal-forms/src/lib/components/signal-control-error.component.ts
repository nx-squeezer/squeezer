import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Component to display form errors.
 */
@Component({
  selector: 'ngx-control-error',
  template: '<ng-content/>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalControlErrorComponent {}
