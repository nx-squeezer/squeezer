import { SignalValidator } from '../models/signal-validator';

/**
 * Required validator as a const to avoid creating new instances on every usage.
 */
const requiredValidator: SignalValidator<string, 'required'> = {
  key: 'required',
  validate(value: string) {
    return value.length > 0;
  },
  config: {},
};

/**
 * Required validator for text controls.
 */
export const required = (): SignalValidator<string, 'required'> => requiredValidator;
