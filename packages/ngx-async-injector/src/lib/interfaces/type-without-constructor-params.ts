/**
 * Type of a constructor without params used for class async providers.
 */
export interface TypeWithoutConstructorParams<T> extends Function {
  new (): T;
}
