import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SignalControlDirective } from './signal-control.directive';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlStatusClasses } from '../models/signal-control-status-classes';
import { SignalValidationResult } from '../models/signal-validator';
import { SIGNAL_CONTROL_STATUS_CLASSES } from '../tokens/signal-control-status-classes.token';
import { maxLength } from '../validators/max-length';
import { required } from '../validators/required';

const text = 'text';
const newText = 'new text';
const requiredMsg = 'This field is required';
const maxLengthMsg = 'This field is too long';

@Component({
  template: `
    <input #inputTag type="text" ngxTextInput [ngxControl]="value" [validators]="validators" #ngxControl="ngxControl" />

    @if (ngxControl.error('required'); as error) {
    <p #requiredError>${requiredMsg}</p>
    } @if (ngxControl.error('maxLength'); as error) {
    <p #maxLengthError>${maxLengthMsg} ({{ ngxControl.value().length }}/{{ error.config }})</p>
    }
  `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly value = signal(text);

  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);
  readonly validators = [required(), maxLength(5)];
  readonly controlDirective =
    viewChild.required<SignalControlDirective<string, typeof this.validators>>(SignalControlDirective);
  readonly requiredError = viewChild<ElementRef<HTMLParagraphElement>>('requiredError');
  readonly maxLengthError = viewChild<ElementRef<HTMLParagraphElement>>('maxLengthError');

  type(str: string) {
    this.inputElement().value = str;
    this.inputElement().dispatchEvent(new Event('input'));
  }

  blur() {
    this.inputElement().blur();
    this.inputElement().dispatchEvent(new Event('blur'));
  }
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
    it('should infer correct types', () => {
      const requiredError = component.controlDirective().error('required') satisfies
        | SignalValidationResult<'required', {}>
        | undefined;
      const maxLengthError = component.controlDirective().error('maxLength') satisfies
        | SignalValidationResult<'maxLength', {}>
        | undefined;

      const otherError = component.controlDirective().error('randomError' as any) satisfies
        | SignalValidationResult<'required', {}>
        | SignalValidationResult<'maxLength', {}>
        | undefined;

      expect(requiredError).toBeUndefined();
      expect(maxLengthError).toBeUndefined();
      expect(otherError).toBeUndefined();
    });

    it('should detect valid state', () => {
      component.value.set(text);

      expect(component.controlDirective().errors()).toStrictEqual([]);
      expect(component.controlDirective().error('required')).toBeUndefined();
      expect(component.controlDirective().error('maxLength')).toBeUndefined();
      expect(component.controlDirective().error('randomError' as any)).toBeUndefined();
      expect(component.controlDirective().status()).toBe('VALID');
      expect(component.controlDirective().valid()).toBeTruthy();
      expect(component.controlDirective().invalid()).toBeFalsy();

      expect(component.inputElement()).toHaveClass(statusClasses.valid);
      expect(component.inputElement()).not.toHaveClass(statusClasses.invalid);

      expect(component.requiredError()).toBeFalsy();
    });

    it('should detect invalid state for required validator', () => {
      component.value.set('');

      TestBed.flushEffects();

      expect(component.controlDirective().errors()).toStrictEqual([{ key: 'required', config: {} }]);
      expect(component.controlDirective().error('required')).toStrictEqual({ key: 'required', config: {} });
      expect(component.controlDirective().error('maxLength')).toBeUndefined();
      expect(component.controlDirective().error('randomError' as any)).toBeUndefined();
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.inputElement()).not.toHaveClass(statusClasses.valid);
      expect(component.inputElement()).toHaveClass(statusClasses.invalid);

      expect(component.requiredError()?.nativeElement).toHaveTextContent(requiredMsg);
    });

    it('should detect invalid state for max length validator', () => {
      component.value.set(newText);

      TestBed.flushEffects();

      expect(component.controlDirective().errors()).toStrictEqual([{ key: 'maxLength', config: 5 }]);
      expect(component.controlDirective().error('required')).toBeUndefined();
      expect(component.controlDirective().error('maxLength')).toStrictEqual({ key: 'maxLength', config: 5 });
      expect(component.controlDirective().error('randomError' as any)).toBeUndefined();
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.inputElement()).not.toHaveClass(statusClasses.valid);
      expect(component.inputElement()).toHaveClass(statusClasses.invalid);

      expect(component.maxLengthError()?.nativeElement).toHaveTextContent('This field is too long (8/5)');
    });
  });

  describe('pristine', () => {
    it('should be pristine before interaction', () => {
      expect(component.controlDirective().pristine()).toBeTruthy();
      expect(component.inputElement()).toHaveClass(statusClasses.pristine);

      expect(component.controlDirective().dirty()).toBeFalsy();
      expect(component.inputElement()).not.toHaveClass(statusClasses.dirty);
    });

    it('should be dirty after interaction', () => {
      component.type(newText);

      expect(component.controlDirective().pristine()).toBeFalsy();
      expect(component.inputElement()).not.toHaveClass(statusClasses.pristine);

      expect(component.controlDirective().dirty()).toBeTruthy();
      expect(component.inputElement()).toHaveClass(statusClasses.dirty);
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

  describe('touched', () => {
    it('should be untouched before interaction', () => {
      expect(component.controlDirective().untouched()).toBeTruthy();
      expect(component.inputElement()).toHaveClass(statusClasses.untouched);

      expect(component.controlDirective().touched()).toBeFalsy();
      expect(component.inputElement()).not.toHaveClass(statusClasses.touched);
    });

    it('should be touched after interaction', () => {
      component.blur();

      expect(component.controlDirective().untouched()).toBeFalsy();
      expect(component.inputElement()).not.toHaveClass(statusClasses.untouched);

      expect(component.controlDirective().touched()).toBeTruthy();
      expect(component.inputElement()).toHaveClass(statusClasses.touched);
    });

    it('can be set to touched', () => {
      expect(component.controlDirective().touched()).toBeFalsy();

      component.controlDirective().markAsTouched();

      expect(component.controlDirective().touched()).toBeTruthy();
    });

    it('can be set to untouched', () => {
      component.blur();
      expect(component.controlDirective().untouched()).toBeFalsy();

      component.controlDirective().markAsUntouched();

      expect(component.controlDirective().untouched()).toBeTruthy();
    });
  });
});
