import { JsonPipe } from '@angular/common';
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

import { SignalControlErrorComponent } from './signal-control-error.component';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlErrorDirective } from '../directives/signal-control-error.directive';
import { SignalControlDirective } from '../directives/signal-control.directive';
import { SignalValidator } from '../models/signal-validator';
import { maxLength } from '../validators/max-length';
import { required } from '../validators/required';

const newText = 'new text';
const requiredMsg = 'This field is required';
const maxLengthMsg = 'This field is too long';
const ariaDescribedBy = 'aria-describedby';

@Component({
  template: `
    <input
      #inputTag
      type="text"
      ngxTextInput
      [(ngxControl)]="value"
      [validators]="validators()"
      #ngxControl="ngxControl"
    />

    <ngx-control-error *ngxError="ngxControl.errors().required" #errorMsg>${requiredMsg}</ngx-control-error>
    <ngx-control-error *ngxError="ngxControl.errors().maxLength; let config" #errorMsg>
      ${maxLengthMsg} ({{ ngxControl.value().length }}/{{ config }})
    </ngx-control-error>
  `,
  standalone: true,
  imports: [
    InputTextControlValueAccessorDirective,
    SignalControlDirective,
    SignalControlErrorComponent,
    SignalControlErrorDirective,
    JsonPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly value = signal('');

  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);
  readonly validators = signal([required(), maxLength(5)]);
  readonly controlDirective =
    viewChild.required<
      SignalControlDirective<
        string,
        (SignalValidator<string, 'required', {}> | SignalValidator<string | null | undefined, 'maxLength', number>)[]
      >
    >(SignalControlDirective);
  readonly errors = viewChildren<string, ElementRef>('errorMsg', { read: ElementRef });
  readonly errorDirectives = viewChildren(SignalControlErrorDirective);

  type(str: string) {
    this.inputElement().value = str;
    this.inputElement().dispatchEvent(new Event('input'));
  }

  blur() {
    this.inputElement().blur();
    this.inputElement().dispatchEvent(new Event('blur'));
  }
}

describe('SignalControlErrorComponent', () => {
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

  it('should not show the error on initial state', () => {
    expect(component.errors().length).toBe(0);
    expect(component.controlDirective().pristine()).toBeTruthy();
    expect(component.controlDirective().untouched()).toBeTruthy();
  });

  it('should not show the error after input', () => {
    component.type('');

    TestBed.flushEffects();

    expect(component.errors().length).toBe(0);
    expect(component.controlDirective().dirty()).toBeTruthy();
    expect(component.controlDirective().untouched()).toBeTruthy();
  });

  it('should not show the error after blur if value not modified', () => {
    component.blur();

    TestBed.flushEffects();

    expect(component.errors().length).toBe(0);
    expect(component.controlDirective().pristine()).toBeTruthy();
    expect(component.controlDirective().touched()).toBeTruthy();
    expect(component.inputElement()).toHaveAttribute(ariaDescribedBy, '');
  });

  it('should show the error after blur when there was interaction', () => {
    component.type('');
    component.blur();

    TestBed.flushEffects();

    expect(component.errors().length).toBe(1);
    expect(component.errors()[0].nativeElement).toHaveTextContent(requiredMsg);
    expect(component.errors()[0].nativeElement.id).toBe('ngx-control-error.control.required');
    expect(component.inputElement()).toHaveAttribute(ariaDescribedBy, 'ngx-control-error.control.required');
    expect(component.controlDirective().dirty()).toBeTruthy();
    expect(component.controlDirective().touched()).toBeTruthy();
  });

  it('should not show the error when value is valid', () => {
    component.type('');
    component.blur();

    expect(component.errors()[0].nativeElement).toHaveTextContent(requiredMsg);

    TestBed.flushEffects();

    component.type('test');

    TestBed.flushEffects();

    expect(component.errors().length).toBe(0);
    expect(component.controlDirective().dirty()).toBeTruthy();
    expect(component.controlDirective().touched()).toBeTruthy();
  });

  it('should provide the configuration as the directive context', () => {
    component.type(newText);
    component.blur();

    TestBed.flushEffects();

    expect(component.errors().length).toBe(1);

    expect(component.errors()[0].nativeElement).toHaveTextContent('This field is too long (8/5)');
    expect(component.errors()[0].nativeElement.id).toBe('ngx-control-error.control.maxLength');
    expect(component.inputElement()).toHaveAttribute(ariaDescribedBy, 'ngx-control-error.control.maxLength');
  });

  describe('error directive typing', () => {
    it('should resolve type for directive context', () => {
      const directive = component.errorDirectives()[0];

      expect(SignalControlErrorDirective.ngTemplateContextGuard(directive, {})).toBeTruthy();
    });

    it('should resolve type for directive input', () => {
      const directive = component.errorDirectives()[0];

      expect(SignalControlErrorDirective.ngTemplateGuard_ngxError(directive, {} as any)).toBeTruthy();
      expect(SignalControlErrorDirective.ngTemplateGuard_ngxError(directive, undefined)).toBeFalsy();
    });
  });

  describe('accessibility', () => {
    it('should apply the required and maxlength attributes', () => {
      expect(component.inputElement()).toBeRequired();
      expect(component.inputElement()).toHaveAttribute('maxlength', '5');
    });

    it('should remove the required and maxlength attributes when validators are no longer applied', () => {
      component.validators.set([]);

      fixture.detectChanges();

      expect(component.inputElement()).not.toBeRequired();
      expect(component.inputElement()).not.toHaveAttribute('maxlength');
    });
  });
});
