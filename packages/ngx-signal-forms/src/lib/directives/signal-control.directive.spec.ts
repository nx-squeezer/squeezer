import { ChangeDetectionStrategy, Component, ViewChild, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTextControlValueAccessorDirective } from './control-value-accessors/input-text-control-value-accessor.directive';
import { SignalControlDirective } from './signal-control.directive';

const text = 'text';

@Component({
  template: ` <input #inputTag type="text" ngxTextInput [ngxControl]="control" /> `,
  standalone: true,
  imports: [InputTextControlValueAccessorDirective, SignalControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestComponent {
  readonly control = signal(text);
  @ViewChild('inputTag', { static: true, read: SignalControlDirective })
  readonly controlDirective!: SignalControlDirective<string>;
}

describe('SignalControlDirective', () => {
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

  it('should compile the control directive', () => {
    expect(component.controlDirective).toBeInstanceOf(SignalControlDirective);
  });

  it('should have the value of the value accessor', () => {
    expect(component.controlDirective.control()).toBe(text);
  });

  describe('valid', () => {
    it('should be valid when there are no validators', () => {
      expect(component.controlDirective.errors()).toBeNull();
      expect(component.controlDirective.valid()).toBeTruthy();
    });
  });
});
