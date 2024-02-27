import { SignalValidator } from '../models/signal-validator';

/**
 * Max length validator for text controls.
 */
export const maxLength = (maxLength: number): SignalValidator<string | null | undefined, 'maxLength', number> => ({
  key: 'maxLength',
  validate(value: string | null | undefined): boolean {
    return value != null && value.length <= maxLength;
  },
  config: maxLength,
});
