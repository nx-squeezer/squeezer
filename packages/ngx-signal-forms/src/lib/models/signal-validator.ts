/**
 * Type of a validator.
 */
export interface SignalValidator<TValue, TKey extends string, TConfig = {}> {
  /**
   * Validate function, return true if it is valid.
   */
  validate(value: Readonly<TValue>): boolean;

  /**
   * Error key.
   */
  readonly key: TKey;

  /**
   * Validator configuration.
   */
  readonly config: TConfig;
}

/**
 * Validation result type of a validator.
 */
export interface SignalValidationResult<TKey extends string, TConfig = {}> {
  /**
   * Error key.
   */
  readonly key: TKey;

  /**
   * Validator configuration.
   */
  readonly config: TConfig;
}

/**
 * Type utility to derive the validator results from a collection of validators.
 */
export type SignalValidatorResults<TValidators extends readonly unknown[]> = TValidators extends (infer TValidator)[]
  ? TValidator extends SignalValidator<any, infer K, infer C>
    ? SignalValidationResult<K, C>[]
    : never
  : never;

/**
 * Type utility to derive the validator keys from a collection of validators.
 */
export type SignalValidatorKeys<TValidators extends readonly unknown[]> = TValidators extends (infer TValidator)[]
  ? TValidator extends SignalValidator<any, infer K>
    ? K
    : never
  : never;

/**
 * Type utility to get a validator result by key from a collection of validators.
 */
export type SignalValidatorResultByKey<
  TValidators extends readonly unknown[],
  K extends SignalValidatorKeys<TValidators>
> = Extract<
  SignalValidatorResults<TValidators> extends (infer TValidatorResult)[] ? TValidatorResult : never,
  { key: K }
>;
