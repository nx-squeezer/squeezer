import { AsyncStaticProvider } from './async-static-provider';

export type AsyncProviderTypes<T extends unknown[]> = {
  [K in keyof T]: AsyncStaticProvider<T[K]>;
};
