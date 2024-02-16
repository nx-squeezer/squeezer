import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlDirective } from './signal-control.directive';
import { control } from '../models/control-signal';
import { RequiredValidationError } from '../models/validation-errors';
import { Validator } from '../models/validator';

const text = 'text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [ngxControl]="control" [validators]="[requiredValidator]" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly control = control(text);
  readonly controlDirective = viewChild.required<SignalControlDirective<string>>(SignalControlDirective);

  readonly requiredValidator: Validator<string, RequiredValidationError> = (value) => {
    return value.trim().length === 0 ? { required: true } : null;
  };
}

describe('SignalControlDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
  });

  it('should create test component', () => {
    expect(component).toBeTruthy();
  });

  it('should compile the control directive', () => {
    expect(component.controlDirective()).toBeInstanceOf(SignalControlDirective);
  });

  it('should have the value of the value accessor', () => {
    const control = component.controlDirective().control();
    expect(control()).toBe(text);
  });

  describe('validity', () => {
    it('should detect valid state', () => {
      component.control.set(text);

      expect(component.control.errors()).toBeNull();
      expect(component.control.status()).toBe('VALID');
      expect(component.control.valid()).toBeTruthy();
      expect(component.control.invalid()).toBeFalsy();
    });

    it('should detect invalid state', () => {
      component.control.set(' ');

      expect(component.control.errors()).toStrictEqual({ required: true });
      expect(component.control.status()).toBe('INVALID');
      expect(component.control.valid()).toBeFalsy();
      expect(component.control.invalid()).toBeTruthy();
    });
  });
});
