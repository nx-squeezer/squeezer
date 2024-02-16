import { ValidationErrors } from './validation-errors';

/**
 * Type of a validator function.
 */
export type Validator<T, V extends ValidationErrors> = (value: T) => V | null;
