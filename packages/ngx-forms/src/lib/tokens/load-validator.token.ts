import { InjectionToken } from '@angular/core';

import { LoadValidatorFn } from '../types/load-validator-fn';

/**
 * Token that defines a lazy validator.
 * @internal
 */
export const LOAD_VALIDATOR = new InjectionToken<LoadValidatorFn>('ngx-forms.load-validator');
