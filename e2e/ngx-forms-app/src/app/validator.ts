import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value === 'invalid' ? { invalid: true } : null;
};

export default validator;
