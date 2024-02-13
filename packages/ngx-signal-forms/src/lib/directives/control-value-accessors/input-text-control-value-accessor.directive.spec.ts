import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './input-text-control-value-accessor.directive';

const text = 'text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [ngxControl]="control" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly control = signal(text);
  @ViewChild('inputTag', { static: true }) readonly inputElementRef!: ElementRef<HTMLInputElement>;

  get inputElement(): HTMLInputElement {
    return this.inputElementRef.nativeElement;
  }

  type(str: string) {
    this.inputElement.value = str;
    this.inputElement.dispatchEvent(new Event('input'));
  }
}

describe('InputTextControlValueAccessorDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
  });

  it('should create test component', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect model to HTML input element', () => {
    expect(component.control()).toBe(text);
    expect(component.inputElement.value).toBe(text);
  });

  it('should update the control value when input changes', () => {
    const newText = 'new text';

    component.type(newText);

    expect(component.control()).toBe(newText);
  });
});
