import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlDirective } from './signal-control.directive';
import { requiredValidator } from '../validators/required-validator';

const text = 'text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [ngxControl]="value" [validators]="[requiredValidator]" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly value = signal(text);
  readonly controlDirective = viewChild.required<SignalControlDirective<string>>(SignalControlDirective);
  readonly requiredValidator = requiredValidator;
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
      component.value.set(text);

      expect(component.controlDirective().errors()).toBeNull();
      expect(component.controlDirective().status()).toBe('VALID');
      expect(component.controlDirective().valid()).toBeTruthy();
      expect(component.controlDirective().invalid()).toBeFalsy();
    });

    it('should detect invalid state', () => {
      component.value.set(' ');

      expect(component.controlDirective().errors()).toStrictEqual({ required: true });
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();
    });
  });
});
