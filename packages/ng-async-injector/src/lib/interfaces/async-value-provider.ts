import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';

export interface AsyncValueProvider<T> extends AsyncProviderConfig<T> {
  useAsyncValue: () => Promise<T>;
}

export function isAsyncValueProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncValueProvider<T> {
  return (asyncStaticProvider as any).useAsyncValue != null;
}
