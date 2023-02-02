import { ArrayItemType } from './array-item';
import { AsyncMultiProvider } from './async-multi-provider';
import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';
import { InjectionContext } from './injection-context';

export type AsyncFactoryWithInjectionContext<T> = (injectionContext: InjectionContext) => T;

export interface AsyncFactoryProvider<T> extends AsyncProviderConfig<T> {
  useAsyncFactory: () => Promise<AsyncFactoryWithInjectionContext<T>>;
}

export interface AsyncFactoryMultiProvider<T extends unknown[]> extends AsyncProviderConfig<T>, AsyncMultiProvider {
  useAsyncFactory: () => Promise<AsyncFactoryWithInjectionContext<ArrayItemType<T>>>;
}

export function isAsyncFactoryProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncFactoryProvider<T> | AsyncFactoryMultiProvider<T[]> {
  return (asyncStaticProvider as any).useAsyncFactory != null;
}
