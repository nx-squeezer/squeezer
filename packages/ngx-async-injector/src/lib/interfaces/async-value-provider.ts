import { ArrayItemType } from './array-item';
import { AsyncMultiProvider } from './async-multi-provider';
import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';

/**
 * Type to define an async value provider.
 */
export interface AsyncValueProvider<T> extends AsyncProviderConfig<T> {
  /**
   * Async value import.
   */
  useAsyncValue: () => Promise<T>;
}

/**
 * Type to define an async value multi provider.
 */
export interface AsyncValueMultiProvider<T extends unknown[]> extends AsyncProviderConfig<T>, AsyncMultiProvider {
  /**
   * Async value import.
   */
  useAsyncValue: () => Promise<ArrayItemType<T>>;
}

/**
 * Type guard to check if a provider is an async value provider.
 */
export function isAsyncValueProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncValueProvider<T> | AsyncValueMultiProvider<T[]> {
  return (asyncStaticProvider as any).useAsyncValue != null;
}
