import { Validator } from '../models/validator';

/**
 * Required validation error.
 */
export type RequiredValidationError = {
  /**
   * Error key.
   */
  required: true;
};

/**
 * Required validator for text controls.
 */
export const required: Validator<string, RequiredValidationError> = (value) => {
  return value.trim().length === 0 ? { required: true } : null;
};
