import { SignalValidator } from '../models/signal-validator';

/**
 * Required validator as a const to avoid creating new instances on every usage.
 * TODO: make compatible with other types and nullable
 */
const requiredValidator: SignalValidator<string, 'required'> = {
  key: 'required',
  validate(value: string): boolean {
    return value.length > 0;
  },
  config: {},
};

/**
 * Required validator for text controls.
 */
export const required = (): SignalValidator<string, 'required'> => requiredValidator;
