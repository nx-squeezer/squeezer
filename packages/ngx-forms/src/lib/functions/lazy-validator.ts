import { ChangeDetectorRef, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { extractDefaultExport } from './extract-default-export';
import { LoadValidatorFn } from '../types/load-validator-fn';

export function lazyValidator(loadValidatorFn: LoadValidatorFn): AsyncValidatorFn {
  const cdr = inject(ChangeDetectorRef);

  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const validator = extractDefaultExport(await loadValidatorFn());
    cdr.markForCheck();
    return validator(control);
  };
}
