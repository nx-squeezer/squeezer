import { InjectionToken } from '@angular/core';

import { LoadValidatorFn } from '../types/load-validator-fn';

/**
 * @private
 */
export const LOAD_VALIDATOR = new InjectionToken<LoadValidatorFn>('ngx-forms.load-validator');
