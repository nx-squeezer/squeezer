import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlDirective } from './signal-control.directive';
import { SignalFormGroupDirective } from './signal-form-group.directive';

jest.useFakeTimers({ advanceTimers: true });

interface FormValue {
  text: string;
}

const text = 'text';
const newText = 'newText';
const initialValue: FormValue = { text };

const RENDER_INPUT = new InjectionToken<boolean>('render-input');

@Component({
  template: `
    <form #formTag [ngxFormGroup]="value" #ngxFormGroup="ngxFormGroup">
      @if (renderInput) {
      <input #inputTag type="text" ngxTextInput [ngxControl]="ngxFormGroup.get('text')" />
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

  @ViewChild('formTag', { read: SignalFormGroupDirective })
  readonly formGroupDirective!: SignalFormGroupDirective<FormValue>;

  @ViewChild('inputTag') readonly inputElementRef!: ElementRef<HTMLInputElement> | undefined;

  get inputElement(): HTMLInputElement | undefined {
    return this.inputElementRef?.nativeElement;
  }

  type(str: string) {
    if (this.inputElement == null) {
      return;
    }
    this.inputElement.value = str;
    this.inputElement.dispatchEvent(new Event('input'));
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

    jest.advanceTimersByTime(20);

    return { component };
  }

  it('should create test component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should compile the form group directive', async () => {
    const { component } = await setup();

    expect(component.formGroupDirective).toBeInstanceOf(SignalFormGroupDirective);
  });

  describe('value', () => {
    it('should have the value set', async () => {
      const { component } = await setup();

      expect(component.formGroupDirective.control()).toBe(initialValue);
    });

    it('should reflect model initial state to HTML input element', async () => {
      const { component } = await setup();

      expect(component.inputElement?.value).toBe(initialValue.text);
    });

    it('should reflect updates to model to HTML input element', async () => {
      const { component } = await setup();

      component.value.set({ text: newText });

      TestBed.flushEffects();

      expect(component.inputElement?.value).toBe(newText);
    });

    it('should update the control value when input changes', async () => {
      const { component } = await setup();

      component.type(newText);

      TestBed.flushEffects();

      expect(component.value()).toStrictEqual({ text: newText });
    });

    it('should persist value even if child controls are not used', async () => {
      const { component } = await setup(false);

      expect(component.formGroupDirective.control()).toBe(initialValue);
    });
  });

  describe('child controls', () => {
    it('child control should have initial value', async () => {
      const { component } = await setup();

      const textControl = component.formGroupDirective.get('text');

      expect(textControl).toBeTruthy();
      expect(component.formGroupDirective.control().text).toBe(initialValue.text);
      expect(textControl()).toBe(initialValue.text);
    });

    it('child control should have value on lazy binding', async () => {
      const { component } = await setup(false);

      component.value.set({ text: newText });
      const textControl = component.formGroupDirective.get('text');

      expect(textControl).toBeTruthy();
      expect(component.formGroupDirective.control().text).toBe(newText);
      expect(textControl()).toBe(newText);
    });

    it('should use the same instance if getting a child control multiple times', async () => {
      const { component } = await setup();

      expect(component.formGroupDirective.get('text')).toBe(component.formGroupDirective.get('text'));
    });
  });

  describe('valid', () => {
    it('should be valid when there are no validators', async () => {
      const { component } = await setup();

      expect(component.formGroupDirective.errors()).toBeNull();
      expect(component.formGroupDirective.valid()).toBeTruthy();
    });
  });
});
