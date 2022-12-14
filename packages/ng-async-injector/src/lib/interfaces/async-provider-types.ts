import { AsyncStaticProvider } from './async-static-provider';

export type AsyncProviderTypes<T extends any[]> = {
  [K in keyof T]: AsyncStaticProvider<T[K]>;
};
