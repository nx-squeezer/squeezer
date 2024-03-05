import { InjectionToken } from '@angular/core';

import { SignalControlStatusClasses } from '../models/signal-control-status-classes';

/**
 * This token defines the CSS classes that are added to controls depending on their status.
 */
export const SIGNAL_CONTROL_STATUS_CLASSES = new InjectionToken('ngx-signal-forms.signal-control-status-classes', {
  providedIn: 'root',
  factory(): SignalControlStatusClasses {
    return {
      valid: 'ngx-valid',
      invalid: 'ngx-invalid',
      pristine: 'ngx-pristine',
      dirty: 'ngx-dirty',
      touched: 'ngx-touched',
      untouched: 'ngx-untouched',
      disabled: 'ngx-disabled',
    };
  },
});
