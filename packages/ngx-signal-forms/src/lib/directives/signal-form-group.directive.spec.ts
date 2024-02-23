import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalControlDirective } from './signal-control.directive';
import { SignalFormGroupDirective } from './signal-form-group.directive';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { Validator } from '../models/validator';
import { requiredValidator } from '../validators/required-validator';

interface FormValue {
  text: string;
}

type TooLongValidationError = {
  tooLong: true;
};

const text = 'text';
const newText = 'newText';
const initialValue: FormValue = { text };

@Component({
  template: `
    <form #formTag [ngxFormGroup]="value" #ngxFormGroup="ngxFormGroup" [validators]="[formGroupValidator]">
      @if (renderInput()) {
      <input
        #inputTag
        type="text"
        ngxTextInput
        [ngxControl]="ngxFormGroup.get('text')"
        [validators]="[requiredValidator]"
      />
      }
    </form>
  `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective, SignalFormGroupDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly renderInput = signal(true);
  readonly value = signal<FormValue>(initialValue);
  readonly inputElementRef = viewChild<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef()?.nativeElement);
  readonly formGroupDirective = viewChild.required<SignalFormGroupDirective<FormValue>>(SignalFormGroupDirective);
  readonly controlDirective = viewChild<SignalControlDirective<string>>(SignalControlDirective);
  readonly requiredValidator = requiredValidator;
  readonly formGroupValidator: Validator<FormValue, TooLongValidationError> = (value) => {
    return value.text.length > 5 ? { tooLong: true } : null;
  };

  type(str: string) {
    const inputElement = this.inputElement();
    if (inputElement == null) {
      return;
    }
    inputElement.value = str;
    inputElement.dispatchEvent(new Event('input'));
  }
}

describe('SignalFormGroupDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
  });

  it('should create test component', () => {
    expect(component).toBeTruthy();
  });

  it('should compile the form group directive', () => {
    expect(component.formGroupDirective()).toBeInstanceOf(SignalFormGroupDirective);
  });

  describe('value', () => {
    it('should have the value set', () => {
      const control = component.formGroupDirective().control();

      expect(control()).toBe(initialValue);
    });

    it('should reflect model initial state to HTML input element', () => {
      expect(component.inputElement()?.value).toBe(initialValue.text);
    });

    it('should reflect updates to model to HTML input element', () => {
      component.value.set({ text: newText });

      TestBed.flushEffects();

      expect(component.inputElement()?.value).toBe(newText);
    });

    it('should update the control value when input changes', () => {
      component.type(newText);

      expect(component.value()).toStrictEqual({ text: newText });
    });

    it('should persist value even if child controls are not used', () => {
      component.renderInput.set(false);
      fixture.detectChanges();

      const control = component.formGroupDirective().control();

      expect(component.controlDirective()).toBeFalsy();
      expect(control()).toBe(initialValue);
    });
  });

  describe('child controls', () => {
    it('child control should have initial value', () => {
      const textControl = component.formGroupDirective().get('text');

      expect(textControl).toBeTruthy();
      expect(textControl()).toBe(initialValue.text);
    });

    it('child control should have value on lazy binding', () => {
      component.renderInput.set(false);
      fixture.detectChanges();

      component.value.set({ text: newText });
      const textControl = component.formGroupDirective().get('text');

      expect(component.controlDirective()).toBeFalsy();
      expect(textControl).toBeTruthy();
      expect(textControl()).toBe(newText);
    });

    it('should use the same instance if getting a child control multiple times', () => {
      expect(component.formGroupDirective().get('text')).toBe(component.formGroupDirective().get('text'));
    });

    it('should set the key and parent of child controls', () => {
      expect(component.controlDirective()?.parent()).toBe(component.formGroupDirective());
      expect(component.controlDirective()?.key()).toBe('text');
    });

    it('should set the path of the form group and child controls', () => {
      expect(component.formGroupDirective().path()).toBe('form-group');
      expect(component.controlDirective()?.path()).toBe('form-group.text');
    });
  });

  describe('validity', () => {
    it('should detect valid state according to validators of the form group', () => {
      component.value.set(initialValue);

      expect(component.formGroupDirective().errors()).toBeNull();
      expect(component.formGroupDirective().status()).toBe('VALID');
      expect(component.formGroupDirective().valid()).toBeTruthy();
      expect(component.formGroupDirective().invalid()).toBeFalsy();
    });

    it('should detect invalid state according to validators of the form group', () => {
      component.value.set({ text: newText });

      expect(component.formGroupDirective().errors()).toStrictEqual({ tooLong: true });
      expect(component.formGroupDirective().status()).toBe('INVALID');
      expect(component.formGroupDirective().valid()).toBeFalsy();
      expect(component.formGroupDirective().invalid()).toBeTruthy();
    });

    it('should detect valid state according to validators of child controls', () => {
      component.value.set({ text: '' });

      expect(component.formGroupDirective().errors()).toBeNull();
      expect(component.formGroupDirective().status()).toBe('INVALID');
      expect(component.formGroupDirective().valid()).toBeFalsy();
      expect(component.formGroupDirective().invalid()).toBeTruthy();
    });
  });

  describe('pristine', () => {
    it('should be pristine before interaction', () => {
      expect(component.formGroupDirective().pristine()).toBeTruthy();
      expect(component.formGroupDirective().dirty()).toBeFalsy();
    });

    it('should be dirty after interaction', () => {
      component.type(newText);

      expect(component.formGroupDirective().pristine()).toBeFalsy();
      expect(component.formGroupDirective().dirty()).toBeTruthy();
    });

    it('can be set to dirty, affecting child controls', () => {
      expect(component.formGroupDirective().dirty()).toBeFalsy();
      expect(component.controlDirective()?.dirty()).toBeFalsy();

      component.formGroupDirective().markAsDirty();

      expect(component.formGroupDirective().dirty()).toBeTruthy();
      expect(component.controlDirective()?.dirty()).toBeTruthy();
    });

    it('can be set to pristine, affecting child controls', () => {
      component.type(newText);
      expect(component.formGroupDirective().pristine()).toBeFalsy();
      expect(component.controlDirective()?.pristine()).toBeFalsy();

      component.formGroupDirective().markAsPristine();

      expect(component.formGroupDirective().pristine()).toBeTruthy();
      expect(component.controlDirective()?.pristine()).toBeTruthy();
    });
  });
});
