import { InjectionToken } from '@angular/core';

import { SignalControlStatusClasses } from '../models/signal-control-status-classes';

/**
 * Token that has the classes that will be applied to host elements depending.
 * TODO: remove and use build time options
 */
export const SIGNAL_CONTROL_STATUS_CLASSES = new InjectionToken<SignalControlStatusClasses>(
  'ngx-signal-forms.control-status-classes',
  {
    providedIn: 'root',
    factory() {
      return {
        valid: 'ngx-valid',
        invalid: 'ngx-invalid',
      };
    },
  }
);
