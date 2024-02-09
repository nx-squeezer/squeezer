import { SignalControl, control } from './signal-control';

describe('signalControl', () => {
  const initialValue = {};
  let signalControl: SignalControl;

  beforeEach(() => {
    signalControl = control(initialValue);
  });

  it('should create the control with the factory function', () => {
    expect(signalControl()).toBe(initialValue);
  });

  describe('valid', () => {
    it('should be valid when there are no validators', () => {
      expect(signalControl.valid()).toBeTruthy();
    });
  });
});
