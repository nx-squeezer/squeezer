/**
 * Type of a validator.
 */
export interface SignalValidator<TValue, TKey extends string, TConfig = {}> {
  /**
   * Validate function, return true if it is invalid TODO: change to negative
   */
  validate(value: Readonly<TValue>): boolean;

  /**
   * Error key
   */
  key: TKey;

  /**
   * Validator configuration.
   */
  config: TConfig;
}

/**
 * Validation result type of a validator.
 */
export interface SignalValidationResult<TKey extends string, TConfig = {}> {
  /**
   * Error key
   */
  key: TKey;

  /**
   * If true, the error is active.
   */
  error: boolean;

  /**
   * Validator configuration.
   */
  config: TConfig;
}

/**
 * @internal
 * TODO: inline or clarify all of these type utils
 */
export type SignalValidatorResult<T> = T extends SignalValidator<any, infer K, infer C>
  ? SignalValidationResult<K, C>
  : never;

/**
 * @internal
 */
export type ArrayElement<T extends readonly unknown[]> = T extends (infer I)[] ? I : never;

/**
 * @internal
 */
export type SignalValidatorResults<T extends readonly unknown[]> = SignalValidatorResult<ArrayElement<T>>[];

/**
 * @internal
 */
export type SignalValidatorKeys<T> = T extends SignalValidator<any, infer K> ? K : never;
