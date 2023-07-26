import { fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { lazyValidator } from './lazy-validator';

describe('lazyValidator', () => {
  const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return control.value === 'invalid' ? { invalid: true } : null;
  };

  const control = new FormControl('', { asyncValidators: [lazyValidator(() => Promise.resolve(validator))] });

  it('should process valid values', fakeAsync(() => {
    control.setValue('valid');
    expect(control.pending).toBeTruthy();

    tick(0);

    expect(control.valid).toBeTruthy();
    expect(control.hasError('invalid')).toBeFalsy();
  }));

  it('should process invalid values', fakeAsync(() => {
    control.setValue('invalid');
    expect(control.pending).toBeTruthy();

    tick(0);

    expect(control.invalid).toBeTruthy();
    expect(control.hasError('invalid')).toBeTruthy();
  }));
});
