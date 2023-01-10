import { AsyncProviderConfig } from './async-provider-config';
import { AsyncStaticProvider } from './async-static-provider';
import { TypeWithoutConstructorParams } from './type-without-constructor-params';

export interface AsyncClassProvider<T> extends AsyncProviderConfig<T> {
  useAsyncClass: () => Promise<TypeWithoutConstructorParams<T>>;
}

export function isAsyncClassProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncClassProvider<T> {
  return (asyncStaticProvider as any).useAsyncClass != null;
}
