import { inject } from '@angular/core';
import { AsyncValidator, AbstractControl, ValidationErrors } from '@angular/forms';

import { lazyValidator } from '../functions/lazy-validator';
import { LOAD_VALIDATOR } from '../tokens/load-validator.token';

export class LazyValidator implements AsyncValidator {
  private readonly loadValidatorFn = inject(LOAD_VALIDATOR);

  async validate(control: AbstractControl): Promise<ValidationErrors | null> {
    const validator = lazyValidator(this.loadValidatorFn);
    return validator(control);
  }
}
