import { SignalControlDirective } from './../directives/signal-control.directive';
/**
 * Type of a validator.
 */
export interface SignalValidator<TValue, TKey extends string, TConfig = undefined> {
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
  readonly config?: Readonly<TConfig>;

  /**
   * Attributes to apply on host element.
   */
  readonly attributes?: Record<string, string>;
}

/**
 * Validation result type of a validator.
 */
export interface SignalValidationResult<TKey extends string, TConfig = undefined> {
  /**
   * Parent control of validation error.
   */
  readonly control: SignalControlDirective<unknown, SignalValidator<unknown, TKey, TConfig>[]>;

  /**
   * Error key.
   */
  readonly key: TKey;

  /**
   * Validator configuration.
   */
  readonly config: Readonly<TConfig>;
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
  ? TValidator extends SignalValidator<any, infer K, any>
    ? Readonly<K>
    : never
  : never;

/**
 * Type utility to get a validator result by key from a collection of validators.
 */
export type SignalValidatorResultByKey<
  TValidators extends readonly unknown[],
  K extends SignalValidatorKeys<TValidators>,
> = Extract<
  SignalValidatorResults<TValidators> extends (infer TValidatorResult)[] ? Readonly<TValidatorResult> : never,
  { key: K }
>;

/**
 * Type utility to get validation results keyed by error key.
 */
export type SignalValidatorCombinedResults<TValidators extends readonly unknown[]> = {
  [key in SignalValidatorKeys<TValidators>]?: SignalValidatorResultByKey<TValidators, key>;
};
