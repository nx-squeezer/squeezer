import { SignalControl, control } from './signal-control';

describe('signalControl', () => {
  it('should create the control with an initial value using the constructor', () => {
    const initialValue = {};
    const signalControl = new SignalControl(initialValue);

    expect(signalControl.value()).toBe(initialValue);
    expect(signalControl.initialValue).toBe(initialValue);
  });

  it('should create the control with the factory function', () => {
    const initialValue = {};
    const signalControl = control(initialValue);

    expect(signalControl.value()).toBe(initialValue);
    expect(signalControl.initialValue).toBe(initialValue);
  });
});
