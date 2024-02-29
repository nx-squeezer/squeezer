import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SignalControlErrorComponent } from './signal-control-error.component';
import { InputTextControlValueAccessorDirective } from '../control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlErrorDirective } from '../directives/signal-control-error.directive';
import { SignalControlDirective } from '../directives/signal-control.directive';
import { required } from '../validators/required';

const requiredMsg = 'This field is required';

@Component({
  template: `
    <input #inputTag type="text" ngxTextInput [ngxControl]="value" [validators]="validators" #ngxControl="ngxControl" />

    <ngx-control-error *ngxError="ngxControl.error('required')" #requiredError>${requiredMsg}</ngx-control-error>
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
  readonly validators = required();
  readonly controlDirective =
    viewChild.required<SignalControlDirective<string, (typeof this.validators)[]>>(SignalControlDirective);
  readonly requiredError = viewChild<SignalControlErrorComponent, ElementRef<HTMLElement>>(
    SignalControlErrorComponent,
    {
      read: ElementRef,
    }
  );

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

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
  });

  it('should create test component', () => {
    expect(component).toBeTruthy();
  });

  it('should not show the error on initial state', () => {
    expect(component.requiredError()).toBeFalsy();
    expect(component.controlDirective().pristine()).toBeTruthy();
    expect(component.controlDirective().untouched()).toBeTruthy();
  });

  it('should not show the error after input', () => {
    component.type('');

    TestBed.flushEffects();

    expect(component.requiredError()).toBeFalsy();
    expect(component.controlDirective().dirty()).toBeTruthy();
    expect(component.controlDirective().untouched()).toBeTruthy();
  });

  it('should not show the error after blur if value not modified', () => {
    component.blur();

    TestBed.flushEffects();

    expect(component.requiredError()).toBeFalsy();
    expect(component.controlDirective().pristine()).toBeTruthy();
    expect(component.controlDirective().touched()).toBeTruthy();
  });

  it('should show the error after blur when there was interaction', () => {
    component.type('');
    component.blur();

    TestBed.flushEffects();

    expect(component.requiredError()?.nativeElement).toHaveTextContent(requiredMsg);
    expect(component.controlDirective().dirty()).toBeTruthy();
    expect(component.controlDirective().touched()).toBeTruthy();
  });

  it('should not show the error when value is valid', () => {
    component.type('');
    component.blur();

    expect(component.requiredError()?.nativeElement).toHaveTextContent(requiredMsg);

    TestBed.flushEffects();

    component.type('test');

    TestBed.flushEffects();

    expect(component.requiredError()).toBeFalsy();
    expect(component.controlDirective().dirty()).toBeTruthy();
    expect(component.controlDirective().touched()).toBeTruthy();
  });
});
