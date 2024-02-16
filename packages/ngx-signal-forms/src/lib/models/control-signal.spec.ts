import { signal } from '@angular/core';

import { control, isControl, toControl } from './control-signal';

describe('ControlSignal', () => {
  describe('toControl', () => {
    it('should create a control', () => {
      const numberControl = signal(0);
      expect(toControl(numberControl)()).toBe(0);
    });
  });

  describe('control', () => {
    it('should have a value that can be updated', () => {
      const numberControl = control(0);

      numberControl.set(1);

      expect(numberControl()).toBe(1);
    });

    it('should be valid when there are no validators', () => {
      const numberControl = control(0);

      expect(numberControl.errors()).toBeNull();
      expect(numberControl.status()).toBe('VALID');
      expect(numberControl.valid()).toBeTruthy();
      expect(numberControl.invalid()).toBeFalsy();
    });
  });

  describe('isControl', () => {
    it('should detect when a signal is a control', () => {
      const numberControl = control(0);
      expect(isControl(numberControl)).toBeTruthy();
    });

    it('should detect when a signal is not a control', () => {
      const numberSignal = signal(0);
      expect(isControl(numberSignal)).toBeFalsy();
    });
  });
});
