import { StaticProvider } from '@angular/core';
import { NG_ASYNC_VALIDATORS } from '@angular/forms';

import { LOAD_VALIDATOR } from '../tokens/load-validator.token';
import { LoadValidatorFn } from '../types/load-validator-fn';
import { LazyValidator } from '../validators/lazy-validator';

/**
 * Use this function to provide a lazy validator.
 *
 * @example
 *
 * See how it can be used:
 *
 * ```ts
 * @Directive({
 *   selector: '[lazyValidator]',
 *   standalone: true,
 *   providers: [provideLazyValidator(() => import('./validator'))], // Internally provides NG_ASYNC_VALIDATORS
 * })
 * export class ValidatorDirective {}
 *
 * //...
 * const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
 *   // Large and complex validator
 * };
 *
 * export default validator; // Note that it works with the default export
 * ```
 */
export function provideLazyValidator(loadValidatorFn: LoadValidatorFn): StaticProvider[] {
  return [
    {
      provide: NG_ASYNC_VALIDATORS,
      useClass: LazyValidator,
      multi: true,
      deps: [],
    },
    { provide: LOAD_VALIDATOR, useValue: loadValidatorFn },
  ];
}
