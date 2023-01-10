export interface TypeWithoutConstructorParams<T> extends Function {
  new (): T;
}
