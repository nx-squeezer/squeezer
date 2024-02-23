import { ValidationErrors } from '../models/validation-errors';
import { ValidatorsValueType, ValidatorsErrorType, Validator } from '../models/validator';

/**
 * Creates a validator that is the combination of multiple validators.
 */
export function combineValidators<
  Validators extends unknown[],
  T = ValidatorsValueType<Validators>,
  V extends ValidationErrors = ValidatorsErrorType<Validators>
>(...validators: [...{ [Index in keyof Validators]: Validators[Index] }]): Validator<T, V> {
  return (value: Readonly<T>): V | null => {
    const validationResult = (validators as Validator<T, V>[]).reduce(
      (result, validator) => ({ ...result, ...(validator(value) ?? {}) }),
      {} as V
    );
    return Object.keys(validationResult).length > 0 ? validationResult : null;
  };
}
