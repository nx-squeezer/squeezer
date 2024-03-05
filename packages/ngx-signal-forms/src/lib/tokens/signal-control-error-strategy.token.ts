import { InjectionToken } from '@angular/core';

import { SignalControlErrorStrategy } from '../models/signal-control-error-strategy';

/**
 * This token defines the default strategy used to display control errors.
 */
export const SIGNAL_CONTROL_ERROR_STRATEGY = new InjectionToken('ngx-signal-forms.signal-control-error-strategy', {
  providedIn: 'root',
  factory(): SignalControlErrorStrategy {
    return (control) => control.dirty() && control.touched();
  },
});
