import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { LoadValidatorFn } from '../types/load-validator-fn';

export function lazyValidator(loadValidatorFn: LoadValidatorFn): AsyncValidatorFn {
  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const validatorFn = await loadValidatorFn();
    return validatorFn(control);
  };
}
