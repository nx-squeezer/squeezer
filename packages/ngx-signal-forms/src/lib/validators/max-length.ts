import { SignalValidator } from '../models/signal-validator';

/**
 * Max length validator for text controls.
 * TODO: make compatible with other types and nullable
 */
export const maxLength = (maxLength: number): SignalValidator<string, 'maxLength', number> => ({
  key: 'maxLength',
  validate(value: string): boolean {
    return value.length <= maxLength;
  },
  config: maxLength,
});
