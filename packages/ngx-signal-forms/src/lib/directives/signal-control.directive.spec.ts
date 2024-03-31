import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    <input
      #inputTag
      type="text"
      ngxTextInput
      [(ngxControl)]="value"
      [validators]="validators"
      #ngxControl="ngxControl"
    />

    @if (ngxControl.errors().required; as error) {
      <p #requiredError>${requiredMsg}</p>
    }
    @if (ngxControl.errors().maxLength; as error) {
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
    viewChild.required<SignalControlDirective<string | undefined, typeof this.validators>>(SignalControlDirective);
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
  let fixture: ComponentFixture<TestComponent>;
  let statusClasses: SignalControlStatusClasses;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    statusClasses = TestBed.inject(SIGNAL_CONTROL_STATUS_CLASSES);

    // Workaround so that flush effects runs and updates host properties and view
    TestBed.runInInjectionContext(() => {
      effect(() => component.controlDirective().disabled());
    });

    fixture.autoDetectChanges();
  });

  it('should create test component', () => {
    expect(component).toBeTruthy();
  });

  it('should compile the control directive', () => {
    expect(component.controlDirective()).toBeInstanceOf(SignalControlDirective);
  });

  it('should have the value of the value accessor', () => {
    expect(component.controlDirective().value()).toBe(text);
  });

  describe('validity', () => {
    it('should infer correct types', () => {
      const requiredError = component.controlDirective().errors().required satisfies
        | SignalValidationResult<'required'>
        | undefined;
      const maxLengthError = component.controlDirective().errors().maxLength satisfies
        | SignalValidationResult<'maxLength', number>
        | undefined;

      expect(requiredError).toBeUndefined();
      expect(maxLengthError).toBeUndefined();
    });

    it('should detect valid state', () => {
      component.value.set(text);
      fixture.detectChanges();

      expect(component.controlDirective().errors()).toStrictEqual({});
      expect(component.controlDirective().status()).toBe('VALID');
      expect(component.controlDirective().valid()).toBeTruthy();
      expect(component.controlDirective().invalid()).toBeFalsy();

      expect(component.inputElement()).toHaveClass(statusClasses.valid);
      expect(component.inputElement()).not.toHaveClass(statusClasses.invalid);

      expect(component.requiredError()).toBeFalsy();
    });

    it('should detect invalid state for required validator', () => {
      component.value.set('');
      fixture.detectChanges();

      expect(component.controlDirective().value()).toBe('');

      expect(component.controlDirective().errors()).toEqual({
        required: { key: 'required', control: component.controlDirective() },
      });
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.inputElement()).not.toHaveClass(statusClasses.valid);
      expect(component.inputElement()).toHaveClass(statusClasses.invalid);

      expect(component.requiredError()?.nativeElement).toHaveTextContent(requiredMsg);
    });

    it('should detect invalid state for max length validator', () => {
      component.value.set(newText);
      fixture.detectChanges();

      expect(component.controlDirective().errors()).toStrictEqual({
        maxLength: { key: 'maxLength', config: 5, control: component.controlDirective() },
      });
      expect(component.controlDirective().status()).toBe('INVALID');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeTruthy();

      expect(component.inputElement()).not.toHaveClass(statusClasses.valid);
      expect(component.inputElement()).toHaveClass(statusClasses.invalid);

      expect(component.maxLengthError()?.nativeElement).toHaveTextContent('This field is too long (8/5)');
    });

    it('should not have errors if disabled', () => {
      component.value.set('');
      component.controlDirective().disabled.set(true);

      fixture.detectChanges();

      expect(component.controlDirective().errors()).toStrictEqual({});
      expect(component.controlDirective().status()).toBe('DISABLED');
      expect(component.controlDirective().valid()).toBeFalsy();
      expect(component.controlDirective().invalid()).toBeFalsy();
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

      component.controlDirective().dirty.set(true);

      expect(component.controlDirective().dirty()).toBeTruthy();
    });

    it('can be set to pristine', () => {
      component.type(newText);
      expect(component.controlDirective().pristine()).toBeFalsy();

      component.controlDirective().pristine.set(true);

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

      component.controlDirective().touched.set(true);

      expect(component.controlDirective().touched()).toBeTruthy();
    });

    it('can be set to untouched', () => {
      component.blur();
      expect(component.controlDirective().untouched()).toBeFalsy();

      component.controlDirective().untouched.set(true);

      expect(component.controlDirective().untouched()).toBeTruthy();
    });
  });

  describe('disabled', () => {
    describe('value type extends undefined', () => {
      it('should strictly type disabled input', () => {
        const disabled = component.controlDirective().disabled() satisfies boolean;
        expect(disabled).toBeFalsy();
      });

      it('should strictly type enabled property', () => {
        const enabled = component.controlDirective().enabled() satisfies boolean;
        expect(enabled).toBeTruthy();
      });
    });

    describe('value type does not extend undefined', () => {
      it('should strictly type disabled input', () => {
        const control = component.controlDirective() as unknown as SignalControlDirective<string>;
        const disabled = control.disabled() satisfies false;
        expect(disabled).toBeFalsy();
      });

      it('should strictly type enabled property', () => {
        const control = component.controlDirective() as unknown as SignalControlDirective<string>;
        const enabled = control.enabled() satisfies true;
        expect(enabled).toBeTruthy();
      });
    });

    it('should have disabled status and attribute', () => {
      expect(component.controlDirective().status()).not.toBe('DISABLED');
      expect(component.inputElement()).toBeEnabled();

      component.controlDirective().disabled.set(true);
      TestBed.flushEffects();

      expect(component.controlDirective().status()).toBe('DISABLED');
      expect(component.inputElement()).toBeDisabled();
    });

    it('should have binding with enabled', () => {
      expect(component.controlDirective().disabled()).toBeFalsy();
      expect(component.controlDirective().enabled()).toBeTruthy();

      component.controlDirective().disabled.set(true);

      expect(component.controlDirective().disabled()).toBeTruthy();
      expect(component.controlDirective().enabled()).toBeFalsy();

      component.controlDirective().enabled.set(true);

      expect(component.controlDirective().disabled()).toBeFalsy();
      expect(component.controlDirective().enabled()).toBeTruthy();
    });

    it('should apply disabled class', () => {
      expect(component.inputElement()).not.toHaveClass(statusClasses.disabled);

      component.controlDirective().disabled.set(true);
      TestBed.flushEffects();

      expect(component.inputElement()).toHaveClass(statusClasses.disabled);
    });

    describe('value', () => {
      it('should set the value to undefined when disabled', () => {
        expect(component.controlDirective().value()).toBe(text);

        component.controlDirective().enabled.set(false);
        TestBed.flushEffects();

        expect(component.controlDirective().value()).toBeUndefined();
      });

      it('should be enabled when setting value different than undefined', () => {
        component.controlDirective().enabled.set(false);
        fixture.detectChanges();

        component.value.set(text);
        fixture.detectChanges();

        expect(component.controlDirective().enabled()).toBeTruthy();
      });
    });
  });
});
