import { ArrayItemType } from './array-item';
import { AsyncMultiProvider } from './async-multi-provider';
import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';
import { InjectionContext } from './injection-context';

/**
 * Type of an async factory provider.
 */
export type AsyncFactoryWithInjectionContext<T> = (injectionContext: InjectionContext) => T;

/**
 * Type to define an async factory provider.
 */
export interface AsyncFactoryProvider<T> extends AsyncProviderConfig<T> {
  /**
   * Async factory import.
   */
  useAsyncFactory: () => Promise<AsyncFactoryWithInjectionContext<T>>;
}

/**
 * Type to define an async factory multi provider.
 */
export interface AsyncFactoryMultiProvider<T extends unknown[]> extends AsyncProviderConfig<T>, AsyncMultiProvider {
  /**
   * Async factory import.
   */
  useAsyncFactory: () => Promise<AsyncFactoryWithInjectionContext<ArrayItemType<T>>>;
}

/**
 * Type guard to check if a provider is an async factory provider.
 */
export function isAsyncFactoryProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncFactoryProvider<T> | AsyncFactoryMultiProvider<T[]> {
  return (asyncStaticProvider as any).useAsyncFactory != null;
}
