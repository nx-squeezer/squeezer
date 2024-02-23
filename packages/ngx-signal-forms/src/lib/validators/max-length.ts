import { SignalValidator } from '../models/signal-validator';

/**
 * Max length validator for text controls.
 */
export const maxLength = (maxLength: number): SignalValidator<string, 'maxLength', number> => ({
  key: 'maxLength',
  validate(value) {
    return value.length > maxLength;
  },
  config: maxLength,
});
