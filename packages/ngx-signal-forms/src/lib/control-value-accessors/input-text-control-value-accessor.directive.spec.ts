import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './input-text-control-value-accessor.directive';
import { SignalControlValueAccessor } from '../directives/signal-control-value-accessor.directive';
import { SignalControlDirective } from '../directives/signal-control.directive';

const text = 'text';
const newText = 'new text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [(ngxControl)]="value" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly value = signal(text);
  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);
  readonly controlDirective = viewChild.required<SignalControlDirective<string>>(SignalControlDirective);
  readonly controlValueAccessor = viewChild.required(SignalControlValueAccessor);

  type(str: string) {
    this.inputElement().value = str;
    this.inputElement().dispatchEvent(new Event('input'));
  }
}

describe('InputTextControlValueAccessorDirective', () => {
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
    expect(component.controlValueAccessor()).toBeInstanceOf(SignalControlValueAccessor);
  });

  it('should reflect model initial state to HTML input element', () => {
    expect(component.value()).toBe(text);
    expect(component.inputElement()).toHaveValue(text);
    expect(component.controlDirective().pristine()).toBeTruthy();
    expect(component.controlDirective().dirty()).toBeFalsy();
  });

  it('should reflect updates to model to HTML input element', () => {
    component.value.set(newText);
    fixture.detectChanges();

    expect(component.inputElement()).toHaveValue(newText);
    expect(component.controlDirective().pristine()).toBeTruthy();
  });

  it('should update the control value when input changes', () => {
    component.type(newText);

    expect(component.value()).toBe(newText);
    expect(component.controlDirective().pristine()).toBeFalsy();
    expect(component.controlDirective().dirty()).toBeTruthy();
  });
});
