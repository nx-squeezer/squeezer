import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SignalControlDirective } from './signal-control.directive';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlStatusClasses } from '../models/signal-control-status-classes';
import { SIGNAL_CONTROL_STATUS_CLASSES } from '../tokens/control-status-classes.token';
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
  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);
  readonly requiredValidator = requiredValidator;
}

describe('SignalControlDirective', () => {
  let component: TestComponent;
  let statusClasses: SignalControlStatusClasses;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    statusClasses = TestBed.inject(SIGNAL_CONTROL_STATUS_CLASSES);
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

      expect(component.controlDirective().classes()).toBe(statusClasses.valid);
      expect(component.inputElement()).toHaveClass(statusClasses.valid);
      expect(component.inputElement()).not.toHaveClass(statusClasses.invalid);
    });

    it('should detect invalid state', () => {
      component.value.set(' ');

      TestBed.flushEffects();

      expect(component.controlDirective().errors()).toStrictEqual({ required: true });
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.controlDirective().classes()).toBe(statusClasses.invalid);
      expect(component.inputElement()).not.toHaveClass(statusClasses.valid);
      expect(component.inputElement()).toHaveClass(statusClasses.invalid);
    });
  });
});
