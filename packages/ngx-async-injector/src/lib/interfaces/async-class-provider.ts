import { ArrayItemType } from './array-item';
import { AsyncMultiProvider } from './async-multi-provider';
import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';
import { TypeWithoutConstructorParams } from './type-without-constructor-params';

export interface AsyncClassProvider<T> extends AsyncProviderConfig<T> {
  useAsyncClass: () => Promise<TypeWithoutConstructorParams<T>>;
}

export interface AsyncClassMultiProvider<T extends unknown[]> extends AsyncProviderConfig<T>, AsyncMultiProvider {
  useAsyncClass: () => Promise<TypeWithoutConstructorParams<ArrayItemType<T>>>;
}

export function isAsyncClassProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncClassProvider<T> | AsyncClassMultiProvider<T[]> {
  return (asyncStaticProvider as any).useAsyncClass != null;
}
