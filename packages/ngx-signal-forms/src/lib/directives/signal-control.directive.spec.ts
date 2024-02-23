import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SignalControlDirective } from './signal-control.directive';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlStatusClasses } from '../models/signal-control-status-classes';
import { combineValidators } from '../validators/combine-validators';
import { MaxLengthValidationError, maxLength } from '../validators/max-length';
import { RequiredValidationError, required } from '../validators/required';

const text = 'text';
const newText = 'new text';

@Component({
  template: `
    <input #inputTag type="text" ngxTextInput [ngxControl]="value" [validator]="validator" #ngxControl="ngxControl" />

    @if (ngxControl.error('required'); as error) {
    <p #requiredError>{{ error | json }}</p>
    } @if (ngxControl.error('maxLength'); as error) {
    <p #maxLengthError>{{ error | json }}</p>
    }
  `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly value = signal(text);
  readonly controlDirective =
    viewChild.required<SignalControlDirective<string, RequiredValidationError | MaxLengthValidationError>>(
      SignalControlDirective
    );
  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);
  readonly validator = combineValidators(required, maxLength(5));
  readonly requiredError = viewChild<ElementRef<HTMLParagraphElement>>('requiredError');
  readonly maxLengthError = viewChild<ElementRef<HTMLParagraphElement>>('maxLengthError');

  type(str: string) {
    this.inputElement().value = str;
    this.inputElement().dispatchEvent(new Event('input'));
  }
}

describe('SignalControlDirective', () => {
  let component: TestComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
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
      expect(component.controlDirective().error('required')).toBeNull();
      expect(component.controlDirective().error('maxLength')).toBeNull();
      expect(component.controlDirective().error('randomError' as any)).toBeNull();
      expect(component.controlDirective().status()).toBe('VALID');
      expect(component.controlDirective().valid()).toBeTruthy();
      expect(component.controlDirective().invalid()).toBeFalsy();

      expect(component.inputElement()).toHaveClass(SignalControlStatusClasses.valid);
      expect(component.inputElement()).not.toHaveClass(SignalControlStatusClasses.invalid);

      expect(component.requiredError()).toBeFalsy();
    });

    it('should detect invalid state for required validator', () => {
      component.value.set(' ');

      TestBed.flushEffects();

      expect(component.controlDirective().errors()).toStrictEqual({ required: true });
      expect(component.controlDirective().error('required')).toBeTruthy();
      expect(component.controlDirective().error('maxLength')).toBeNull();
      expect(component.controlDirective().error('randomError' as any)).toBeNull();
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.inputElement()).not.toHaveClass(SignalControlStatusClasses.valid);
      expect(component.inputElement()).toHaveClass(SignalControlStatusClasses.invalid);

      expect(component.requiredError()?.nativeElement).toHaveTextContent('true');
    });

    it('should detect invalid state for max length validator', () => {
      component.value.set(newText);

      TestBed.flushEffects();

      expect(component.controlDirective().errors()).toStrictEqual({ maxLength: true });
      expect(component.controlDirective().error('required')).toBeNull();
      expect(component.controlDirective().error('maxLength')).toBeTruthy();
      expect(component.controlDirective().error('randomError' as any)).toBeNull();
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.inputElement()).not.toHaveClass(SignalControlStatusClasses.valid);
      expect(component.inputElement()).toHaveClass(SignalControlStatusClasses.invalid);

      expect(component.maxLengthError()?.nativeElement).toHaveTextContent('true');
    });
  });

  describe('pristine', () => {
    it('should be pristine before interaction', () => {
      expect(component.controlDirective().pristine()).toBeTruthy();
      expect(component.inputElement()).toHaveClass(SignalControlStatusClasses.pristine);

      expect(component.controlDirective().dirty()).toBeFalsy();
      expect(component.inputElement()).not.toHaveClass(SignalControlStatusClasses.dirty);
    });

    it('should be dirty after interaction', () => {
      component.type(newText);

      expect(component.controlDirective().pristine()).toBeFalsy();
      expect(component.inputElement()).not.toHaveClass(SignalControlStatusClasses.pristine);

      expect(component.controlDirective().dirty()).toBeTruthy();
      expect(component.inputElement()).toHaveClass(SignalControlStatusClasses.dirty);
    });

    it('can be set to dirty', () => {
      expect(component.controlDirective().dirty()).toBeFalsy();

      component.controlDirective().markAsDirty();

      expect(component.controlDirective().dirty()).toBeTruthy();
    });

    it('can be set to pristine', () => {
      component.type(newText);
      expect(component.controlDirective().pristine()).toBeFalsy();

      component.controlDirective().markAsPristine();

      expect(component.controlDirective().pristine()).toBeTruthy();
    });
  });
});
