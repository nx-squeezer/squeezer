import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';

export interface AsyncFactoryProvider<T> extends AsyncProviderConfig<T> {
  useAsyncFactory: () => Promise<() => T>;
}

export function isAsyncFactoryProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncFactoryProvider<T> {
  return (asyncStaticProvider as any).useAsyncFactory != null;
}
