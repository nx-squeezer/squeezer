import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './input-text-control-value-accessor.directive';
import { control } from '../../models/signal-control';

const text = 'text';

@Component({
  template: ` <input #inputTag type="text" [ngxTextInput]="control" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly control = control(text);
  @ViewChild('inputTag', { static: true }) readonly inputElementRef!: ElementRef<HTMLInputElement>;

  get inputElement(): HTMLInputElement {
    return this.inputElementRef.nativeElement;
  }
}

describe('InputTextControlValueAccessorDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create test component', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect model to HTML input element', () => {
    expect(component.inputElement.value).toBe(text);
  });

  it('should update the control value when input changes', () => {
    const newText = 'new text';
    component.inputElement.value = newText;
    component.inputElement.dispatchEvent(new Event('input'));

    expect(component.control()).toBe(newText);
  });
});
