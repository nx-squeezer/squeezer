import { TestBed } from '@angular/core/testing';

import { SignalFormGroup, formGroup } from './signal-form-group';

interface TestValue {
  number: number;
}

describe('SignalFormGroup', () => {
  const initialValue: TestValue = { number: 100 };
  const newTestValue: TestValue = { number: 50 };
  let signalFormGroup: SignalFormGroup<TestValue>;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      signalFormGroup = formGroup(initialValue);
    });
  });

  it('should create the form group with the factory function', () => {
    expect(signalFormGroup()).toStrictEqual(initialValue);
  });

  describe('valid', () => {
    it('should be valid when there are no validators', () => {
      expect(signalFormGroup.valid()).toBeTruthy();
    });
  });

  describe('child controls', () => {
    it('should get child controls', () => {
      expect(signalFormGroup.get('number')).toBeTruthy();
    });

    it('should have the initial value', () => {
      const numberControl = signalFormGroup.get('number');
      expect(numberControl()).toBe(initialValue.number);
    });

    it('should update the value of child controls', () => {
      signalFormGroup.set(newTestValue);

      TestBed.flushEffects();

      const numberControl = signalFormGroup.get('number');
      expect(numberControl()).toBe(newTestValue.number);
    });

    it('should update the value from child controls', () => {
      const numberControl = signalFormGroup.get('number');
      numberControl.set(newTestValue.number);

      TestBed.flushEffects();

      expect(signalFormGroup()).toStrictEqual(newTestValue);
    });
  });
});
