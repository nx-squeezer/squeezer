import { ValidationErrors } from './validation-errors';

/**
 * Type of a validator function.
 */
export type Validator<T, V extends ValidationErrors> = (value: Readonly<T>) => Readonly<V> | null;

/**
 * Extracts the value type of a collection of validators.
 */
export type ValidatorsErrorType<T extends readonly unknown[]> = T extends Validator<any, infer V>[] ? V : never;

/**
 * Extracts the validation error type of a collection of validators.
 */
export type ValidatorsValueType<T extends readonly unknown[]> = T extends Validator<infer V, any>[] ? V : never;
