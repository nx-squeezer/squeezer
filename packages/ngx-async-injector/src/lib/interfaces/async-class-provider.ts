import { ArrayItemType } from './array-item';
import { AsyncMultiProvider } from './async-multi-provider';
import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';
import { TypeWithoutConstructorParams } from './type-without-constructor-params';

/**
 * Type to define an async class provider.
 */
export interface AsyncClassProvider<T> extends AsyncProviderConfig<T> {
  /**
   * Async class import.
   */
  useAsyncClass: () => Promise<TypeWithoutConstructorParams<T>>;
}

/**
 * Type to define an async class multi provider.
 */
export interface AsyncClassMultiProvider<T extends unknown[]> extends AsyncProviderConfig<T>, AsyncMultiProvider {
  /**
   * Async class import.
   */
  useAsyncClass: () => Promise<TypeWithoutConstructorParams<ArrayItemType<T>>>;
}

/**
 * Type guard to check if a provider is an async class provider.
 */
export function isAsyncClassProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncClassProvider<T> | AsyncClassMultiProvider<T[]> {
  return (asyncStaticProvider as any).useAsyncClass != null;
}
