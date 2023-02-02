import { ArrayItemType } from './array-item';
import { AsyncMultiProvider } from './async-multi-provider';
import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';

export interface AsyncValueProvider<T> extends AsyncProviderConfig<T> {
  useAsyncValue: () => Promise<T>;
}

export interface AsyncValueMultiProvider<T extends unknown[]> extends AsyncProviderConfig<T>, AsyncMultiProvider {
  useAsyncValue: () => Promise<ArrayItemType<T>>;
}

export function isAsyncValueProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncValueProvider<T> | AsyncValueMultiProvider<T[]> {
  return (asyncStaticProvider as any).useAsyncValue != null;
}
