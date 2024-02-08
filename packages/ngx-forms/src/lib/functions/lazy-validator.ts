import { ChangeDetectorRef, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { extractDefaultExport } from '@nx-squeezer/utils';

import { LoadValidatorFn } from '../types/load-validator-fn';

/**
 * Function that accepts an import of a validation function and exposes it as an async validator.
 */
export function lazyValidator(loadValidatorFn: LoadValidatorFn): AsyncValidatorFn {
  const cdr = inject(ChangeDetectorRef);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const validator = extractDefaultExport(await loadValidatorFn());
    cdr.markForCheck();
    return validator(control);
  };
}
