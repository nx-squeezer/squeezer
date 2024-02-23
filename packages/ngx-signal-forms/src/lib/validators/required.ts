import { SignalValidator } from '../models/signal-validator';

/**
 * Required validator for text controls.
 */
export const required = (): SignalValidator<string, 'required'> => ({
  key: 'required',
  validate(value: string) {
    return value.trim().length === 0;
  },
  config: {},
});
