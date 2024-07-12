import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputControlValueAccessorDirective } from './input-control-value-accessor.directive';
import { control } from '../primitives/control';

const text = 'text';
const newText = 'new text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [(ngxModel)]="value" [ngxControl]="control" /> `,
  standalone: true,
  imports: [InputControlValueAccessorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly value = signal('');
  readonly control = control(text);
  readonly inputElementRef = viewChild.required<ElementRef<HTMLInputElement>>('inputTag');
  readonly inputElement = computed(() => this.inputElementRef().nativeElement);

  type(str: string) {
    this.inputElement().value = str;
    this.inputElement().dispatchEvent(new Event('input'));
  }
}

describe('InputControlValueAccessorDirective', () => {
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

  it('should reflect model initial state to HTML input element', () => {
    expect(component.value()).toBe(text);
    expect(component.control.value()).toBe(text);
    expect(component.inputElement()).toHaveValue(text);
  });

  it('should reflect updates to model to HTML input element and control', () => {
    component.value.set(newText);
    fixture.detectChanges();
    fixture.detectChanges();

    expect(component.value()).toBe(newText);
    expect(component.inputElement()).toHaveValue(newText);
  });

  it('should reflect updates to control to HTML input element and value', () => {
    component.control.value.set(newText);
    fixture.detectChanges();

    expect(component.value()).toBe(newText);
    expect(component.inputElement()).toHaveValue(newText);
  });

  it('should update the control value when input changes', () => {
    component.type(newText);
    fixture.detectChanges();

    expect(component.control.value()).toBe(newText);
    expect(component.value()).toBe(newText);
  });
});
