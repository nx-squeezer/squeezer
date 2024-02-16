import { signal } from '@angular/core';

import { isControl, toControl } from './control-signal';

describe('ControlSignal', () => {
  describe('toControl', () => {
    it('should create a control', () => {
      const value = signal(0);
      expect(toControl(value)()).toBe(0);
    });
  });

  describe('isControl', () => {
    it('should detect when a signal is a control', () => {
      const value = signal(0);
      expect(isControl(toControl(value))).toBeTruthy();
    });

    it('should detect when a signal is not a control', () => {
      const value = signal(0);
      expect(isControl(value)).toBeFalsy();
    });
  });
});
