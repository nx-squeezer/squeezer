import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalControlDirective } from './signal-control.directive';
import { SignalFormGroupDirective } from './signal-form-group.directive';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { SignalValidationResult, SignalValidator } from '../models/signal-validator';
import { required } from '../validators/required';

interface FormValue {
  text: string;
}

const text = 'text';
const newText = 'newText';
const initialValue: FormValue = { text };

@Component({
  template: `
    <form [(ngxFormGroup)]="value" #formGroup="ngxFormGroup" [validators]="formGroupValidator">
      @if (renderInput()) {
        <input
          #inputTag
          type="text"
          ngxTextInput
          [(ngxControl)]="formGroup.controls.text"
          [validators]="requiredValidator"
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
  readonly controlDirective = viewChild<SignalControlDirective<string | undefined>>(SignalControlDirective);
  readonly requiredValidator = required();
  readonly formGroupValidator: SignalValidator<FormValue, 'tooLong'> = {
    key: 'tooLong',
    validate: (value) => value.text.length <= 5,
    config: {},
  };
  readonly formGroupDirective =
    viewChild.required<SignalFormGroupDirective<FormValue, (typeof this.formGroupValidator)[]>>(
      SignalFormGroupDirective
    );

  type(str: string) {
    const inputElement = this.inputElement();
    if (inputElement == null) {
      return;
    }
    inputElement.value = str;
    inputElement.dispatchEvent(new Event('input'));
  }

  blur() {
    this.inputElement()?.blur();
    this.inputElement()?.dispatchEvent(new Event('blur'));
  }
}

interface ComplexFormValue {
  date: string;
  person: {
    firstName: string;
    lastName: string;
  };
}

@Component({
  template: `
    <form #formTag [(ngxFormGroup)]="value" #rootFormGroup="ngxFormGroup">
      <input type="text" ngxTextInput [(ngxControl)]="rootFormGroup.controls.date" />
      <fieldset [(ngxFormGroup)]="rootFormGroup.controls.person" #personFormGroup="ngxFormGroup">
        <input type="text" ngxTextInput [(ngxControl)]="personFormGroup.controls.firstName" />
        <input type="text" ngxTextInput [(ngxControl)]="personFormGroup.controls.lastName" />
      </fieldset>
    </form>
  `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective, SignalFormGroupDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComplexFormComponent {
  readonly value = signal<ComplexFormValue>({ date: 'today', person: { firstName: 'Bob', lastName: 'Sponge' } });
  readonly inputs = viewChildren(SignalControlDirective);
}

describe('SignalFormGroupDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent, TestComplexFormComponent] }).compileComponents();

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
      expect(component.formGroupDirective().value()).toBe(initialValue);
    });

    it('should reflect model initial state to HTML input element', () => {
      expect(component.inputElement()?.value).toBe(initialValue.text);
    });

    it('should reflect updates to model to HTML input element', () => {
      component.value.set({ text: newText });
      fixture.detectChanges();

      expect(component.inputElement()?.value).toBe(newText);
    });

    it('should update the control value when input changes', () => {
      component.type(newText);

      expect(component.value()).toStrictEqual({ text: newText });
    });

    it('should persist value even if child controls are not used', () => {
      component.renderInput.set(false);
      fixture.detectChanges();

      expect(component.controlDirective()).toBeFalsy();
      expect(component.formGroupDirective().value()).toBe(initialValue);
    });
  });

  describe('child controls', () => {
    it('child control should have initial value', () => {
      const textControl = component.formGroupDirective().controls.text;

      expect(textControl).toBeTruthy();
      expect(component.formGroupDirective().controls().text).toBeTruthy();
      expect(textControl()).toBe(initialValue.text);
      expect(component.formGroupDirective().controls().text?.value()).toBe(initialValue.text);
    });

    it('child control should have value on lazy binding', () => {
      component.renderInput.set(false);
      component.value.set({ text: newText });
      fixture.detectChanges();

      const textControl = component.formGroupDirective().controls.text;

      expect(component.controlDirective()).toBeFalsy();
      expect(component.formGroupDirective().controls().text).toBeFalsy();
      expect(textControl).toBeTruthy();
      expect(textControl()).toBe(newText);
    });

    it('should use the same instance if getting a child control multiple times', () => {
      expect(component.formGroupDirective().controls.text).toBe(component.formGroupDirective().controls.text);
      expect(component.formGroupDirective().controls().text).toBe(component.formGroupDirective().controls().text);
    });

    it('should set the key and parent of child controls', () => {
      expect(component.formGroupDirective().controls().text).toBe(component.controlDirective());
      expect(component.controlDirective()?.parent).toBe(component.formGroupDirective());
      expect(component.controlDirective()?.key).toBe('text');
    });

    it('should set the path of the form group and child controls', () => {
      expect(component.formGroupDirective().path()).toBe('form-group');
      expect(component.controlDirective()?.path()).toBe('form-group.text');
    });

    it('should set the path of deeply nested controls', () => {
      const fixture = TestBed.createComponent(TestComplexFormComponent);
      const component = fixture.componentInstance;
      fixture.autoDetectChanges();

      expect(component.inputs().length).toBe(3);
      expect(component.inputs()[0].path()).toBe('form-group.date');
      expect(component.inputs()[1].path()).toBe('form-group.person.firstName');
      expect(component.inputs()[2].path()).toBe('form-group.person.lastName');
    });
  });

  describe('validity', () => {
    it('should infer correct types', () => {
      const requiredError = component.formGroupDirective().error('tooLong') satisfies
        | SignalValidationResult<'tooLong', {}>
        | undefined;
      const otherError = component.formGroupDirective().error('randomError' as any) satisfies
        | SignalValidationResult<'tooLong', {}>
        | undefined;

      expect(requiredError).toBeUndefined();
      expect(otherError).toBeUndefined();
    });

    it('should detect valid state according to validators of the form group', () => {
      component.value.set(initialValue);
      fixture.detectChanges();

      expect(component.formGroupDirective().errors()).toStrictEqual([]);
      expect(component.formGroupDirective().error('tooLong')).toBeUndefined();
      expect(component.formGroupDirective().error('randomError' as any)).toBeUndefined();
      expect(component.formGroupDirective().status()).toBe('VALID');
      expect(component.formGroupDirective().valid()).toBeTruthy();
      expect(component.formGroupDirective().invalid()).toBeFalsy();
    });

    it('should detect invalid state according to validators of the form group', () => {
      component.value.set({ text: newText });
      fixture.detectChanges();

      expect(component.formGroupDirective().errors()).toStrictEqual([
        { key: 'tooLong', config: {}, control: component.formGroupDirective() },
      ]);
      expect(component.formGroupDirective().error('tooLong')).toStrictEqual({
        key: 'tooLong',
        config: {},
        control: component.formGroupDirective(),
      });
      expect(component.formGroupDirective().error('randomError' as any)).toBeUndefined();
      expect(component.formGroupDirective().status()).toBe('INVALID');
      expect(component.formGroupDirective().valid()).toBeFalsy();
      expect(component.formGroupDirective().invalid()).toBeTruthy();
    });

    it('should detect valid state according to validators of child controls', () => {
      component.value.set({ text: '' });
      fixture.detectChanges();

      expect(component.formGroupDirective().errors()).toStrictEqual([]);
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

      component.formGroupDirective().dirty.set(true);

      expect(component.formGroupDirective().dirty()).toBeTruthy();
      expect(component.controlDirective()?.dirty()).toBeTruthy();
    });

    it('can be set to pristine, affecting child controls', () => {
      component.type(newText);
      expect(component.formGroupDirective().pristine()).toBeFalsy();
      expect(component.controlDirective()?.pristine()).toBeFalsy();

      component.formGroupDirective().pristine.set(true);

      expect(component.formGroupDirective().pristine()).toBeTruthy();
      expect(component.controlDirective()?.pristine()).toBeTruthy();
    });
  });

  describe('touched', () => {
    it('should be untouched before interaction', () => {
      expect(component.controlDirective()?.untouched()).toBeTruthy();
      expect(component.controlDirective()?.touched()).toBeFalsy();

      expect(component.formGroupDirective().untouched()).toBeTruthy();
      expect(component.formGroupDirective().touched()).toBeFalsy();
    });

    it('should be touched after interaction', () => {
      component.blur();

      expect(component.controlDirective()?.untouched()).toBeFalsy();
      expect(component.controlDirective()?.touched()).toBeTruthy();

      expect(component.formGroupDirective().untouched()).toBeFalsy();
      expect(component.formGroupDirective().touched()).toBeTruthy();
    });

    it('can be set to touched, affecting child controls', () => {
      expect(component.formGroupDirective().touched()).toBeFalsy();
      expect(component.controlDirective()?.touched()).toBeFalsy();

      component.formGroupDirective().touched.set(true);

      expect(component.formGroupDirective().touched()).toBeTruthy();
      expect(component.controlDirective()?.touched()).toBeTruthy();
    });

    it('can be set to untouched, affecting child controls', () => {
      component.blur();
      expect(component.formGroupDirective().untouched()).toBeFalsy();
      expect(component.controlDirective()?.untouched()).toBeFalsy();

      component.formGroupDirective().untouched.set(true);

      expect(component.formGroupDirective().untouched()).toBeTruthy();
      expect(component.controlDirective()?.untouched()).toBeTruthy();
    });
  });

  describe('disabled', () => {
    it('should not be disabled even if child controls are', () => {
      component.controlDirective()?.disabled.set(true);

      expect(component.controlDirective()?.disabled()).toBeTruthy();
      expect(component.formGroupDirective().disabled()).toBeFalsy();
    });

    it('should enable child controls', () => {
      component.controlDirective()?.disabled.set(true);
      component.formGroupDirective().enabled.set(true);

      expect(component.controlDirective()?.enabled()).toBeTruthy();
    });
  });
});
