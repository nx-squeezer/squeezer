import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlDirective } from './signal-control.directive';
import { SignalFormGroupDirective } from './signal-form-group.directive';
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

const RENDER_INPUT = new InjectionToken<boolean>('render-input');

@Component({
  template: `
    <form #formTag [ngxFormGroup]="value" #ngxFormGroup="ngxFormGroup" [validators]="[formGroupValidator]">
      @if (renderInput) {
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
  readonly renderInput = inject(RENDER_INPUT);
  readonly value = signal<FormValue>(initialValue);
  readonly inputElementRef = viewChild<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef()?.nativeElement);
  readonly formGroupDirective = viewChild.required<SignalFormGroupDirective<FormValue>>(SignalFormGroupDirective);
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
  async function setup(renderInput = true) {
    await TestBed.configureTestingModule({
      providers: [{ provide: RENDER_INPUT, useValue: renderInput }],
      imports: [TestComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    fixture.autoDetectChanges();

    return { component };
  }

  it('should create test component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should compile the form group directive', async () => {
    const { component } = await setup();

    expect(component.formGroupDirective()).toBeInstanceOf(SignalFormGroupDirective);
  });

  describe('value', () => {
    it('should have the value set', async () => {
      const { component } = await setup();
      const control = component.formGroupDirective().control();

      expect(control()).toBe(initialValue);
    });

    it('should reflect model initial state to HTML input element', async () => {
      const { component } = await setup();

      expect(component.inputElement()?.value).toBe(initialValue.text);
    });

    it('should reflect updates to model to HTML input element', async () => {
      const { component } = await setup();

      component.value.set({ text: newText });

      TestBed.flushEffects();

      expect(component.inputElement()?.value).toBe(newText);
    });

    it('should update the control value when input changes', async () => {
      const { component } = await setup();

      component.type(newText);

      expect(component.value()).toStrictEqual({ text: newText });
    });

    it('should persist value even if child controls are not used', async () => {
      const { component } = await setup(false);
      const control = component.formGroupDirective().control();

      expect(control()).toBe(initialValue);
    });
  });

  describe('child controls', () => {
    it('child control should have initial value', async () => {
      const { component } = await setup();

      const textControl = component.formGroupDirective().get('text');

      expect(textControl).toBeTruthy();
      expect(textControl()).toBe(initialValue.text);
    });

    it('child control should have value on lazy binding', async () => {
      const { component } = await setup(false);

      component.value.set({ text: newText });
      const textControl = component.formGroupDirective().get('text');

      expect(textControl).toBeTruthy();
      expect(textControl()).toBe(newText);
    });

    it('should use the same instance if getting a child control multiple times', async () => {
      const { component } = await setup();

      expect(component.formGroupDirective().get('text')).toBe(component.formGroupDirective().get('text'));
    });
  });

  describe('validity', () => {
    it('should detect valid state according to validators of the form group', async () => {
      const { component } = await setup();
      component.value.set(initialValue);

      expect(component.formGroupDirective().errors()).toBeNull();
      expect(component.formGroupDirective().status()).toBe('VALID');
      expect(component.formGroupDirective().valid()).toBeTruthy();
      expect(component.formGroupDirective().invalid()).toBeFalsy();
    });

    it('should detect invalid state according to validators of the form group', async () => {
      const { component } = await setup();
      component.value.set({ text: newText });

      expect(component.formGroupDirective().errors()).toStrictEqual({ tooLong: true });
      expect(component.formGroupDirective().status()).toBe('INVALID');
      expect(component.formGroupDirective().valid()).toBeFalsy();
      expect(component.formGroupDirective().invalid()).toBeTruthy();
    });

    it('should detect valid state according to validators of child controls', async () => {
      const { component } = await setup();
      component.value.set({ text: '' });

      expect(component.formGroupDirective().errors()).toBeNull();
      expect(component.formGroupDirective().status()).toBe('INVALID');
      expect(component.formGroupDirective().valid()).toBeFalsy();
      expect(component.formGroupDirective().invalid()).toBeTruthy();
    });
  });
});
