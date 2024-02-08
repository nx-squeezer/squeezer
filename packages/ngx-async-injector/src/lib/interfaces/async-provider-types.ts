import { AsyncStaticProvider } from './async-static-provider';

/**
 * Type map for async providers in a keyed map.
 */
export type AsyncProviderTypes<T extends unknown[]> = {
  [K in keyof T]: AsyncStaticProvider<T[K]>;
};
