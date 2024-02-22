import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './input-text-control-value-accessor.directive';

const text = 'text';
const newText = 'new text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [ngxControl]="control" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly control = signal(text);
  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);

  type(str: string) {
    this.inputElement().value = str;
    this.inputElement().dispatchEvent(new Event('input'));
  }
}

describe('InputTextControlValueAccessorDirective', () => {
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

  it('should reflect model initial state to HTML input element', () => {
    expect(component.control()).toBe(text);
    expect(component.inputElement().value).toBe(text);
  });

  it('should reflect updates to model to HTML input element', () => {
    component.control.set(newText);

    TestBed.flushEffects();

    expect(component.inputElement().value).toBe(newText);
  });

  it('should update the control value when input changes', () => {
    component.type(newText);

    expect(component.control()).toBe(newText);
  });
});
