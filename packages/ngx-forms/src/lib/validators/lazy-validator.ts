import { inject, ChangeDetectorRef } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors } from '@angular/forms';

import { LOAD_VALIDATOR } from '../tokens/load-validator.token';

export class LazyValidator implements AsyncValidator {
  private readonly loadValidatorFn = inject(LOAD_VALIDATOR);
  private readonly cdr = inject(ChangeDetectorRef);

  async validate(control: AbstractControl): Promise<ValidationErrors | null> {
    const validator = await this.loadValidatorFn();
    this.cdr.markForCheck();
    return validator(control);
  }
}
