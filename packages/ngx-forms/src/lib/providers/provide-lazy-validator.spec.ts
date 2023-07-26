import { Component, Directive, inject } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';

import { provideLazyValidator } from './provide-lazy-validator';

const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  return control.value === 'invalid' ? { invalid: true } : null;
};

@Directive({
  selector: '[ngxCva]',
  standalone: true,
  providers: [provideLazyValidator(() => Promise.resolve(validator))],
})
class TestCvaDirective {}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, TestCvaDirective],
  template: `
    <ng-container [formGroup]="formGroup">
      <input type="text" formControlName="firstControl" ngxCva />
    </ng-container>
  `,
})
class TestComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.group({
    firstControl: [''],
  });
}

describe('provideLazyValidator', () => {
  let component: TestComponent;

  beforeEach(() => {
    const fixture = TestBed.createComponent(TestComponent);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('should process valid values', fakeAsync(() => {
    component.formGroup.controls.firstControl.setValue('valid');
    expect(component.formGroup.pending).toBeTruthy();

    tick(0);

    expect(component.formGroup.valid).toBeTruthy();
    expect(component.formGroup.controls.firstControl.hasError('invalid')).toBeFalsy();
  }));

  it('should process invalid values', fakeAsync(() => {
    component.formGroup.controls.firstControl.setValue('invalid');
    expect(component.formGroup.pending).toBeTruthy();

    tick(0);

    expect(component.formGroup.invalid).toBeTruthy();
    expect(component.formGroup.controls.firstControl.hasError('invalid')).toBeTruthy();
  }));
});
