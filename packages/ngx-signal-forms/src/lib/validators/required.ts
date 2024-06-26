import { SignalValidator } from '../models/signal-validator';

/**
 * Required validator as a const to avoid creating new instances on every usage.
 * TODO: make compatible with other types
 * TODO: provide type for success
 */
const requiredValidator: SignalValidator<string | null | undefined, 'required'> = {
  key: 'required',
  validate(value): boolean {
    return value != null && value.length > 0;
  },
  attributes: {
    required: '',
  },
};

/**
 * Required validator for text controls.
 */
export const required = (): SignalValidator<string, 'required'> => requiredValidator;
