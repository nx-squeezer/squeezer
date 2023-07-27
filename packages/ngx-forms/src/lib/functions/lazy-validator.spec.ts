import { Component, inject } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { lazyValidator } from './lazy-validator';

const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value === 'invalid' ? { invalid: true } : null;
};

@Component({
  standalone: true,
})
class TestComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.group({
    control: ['', { asyncValidators: [lazyValidator(() => Promise.resolve(validator))] }],
  });
}

describe('lazyValidator', () => {
  let control: FormControl;

  beforeEach(() => {
    const fixture = TestBed.createComponent(TestComponent);
    control = fixture.componentInstance.formGroup.controls.control;
  });

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
