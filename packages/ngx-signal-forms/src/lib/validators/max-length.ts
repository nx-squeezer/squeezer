import { Validator } from '../models/validator';

/**
 * Max length validation error.
 */
export type MaxLengthValidationError = {
  /**
   * Error key.
   */
  maxLength: true;
};

/**
 * Max length validator for text controls.
 */
export const maxLength: (maxLength: number) => Validator<string, MaxLengthValidationError> =
  (maxLength: number) => (value) => {
    return value.length > maxLength ? { maxLength: true } : null;
  };
