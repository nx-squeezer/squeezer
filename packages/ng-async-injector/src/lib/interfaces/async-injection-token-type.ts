import { AsyncInjectionToken } from '../tokens/async-injection-token';

export type AsyncInjectionTokenType<T extends AsyncInjectionToken<any>> = T extends AsyncInjectionToken<infer R>
  ? R
  : never;

export type AsyncInjectionTokenTypes<T extends AsyncInjectionToken<any>[]> = {
  [K in keyof T]: AsyncInjectionTokenType<T[K]>;
};
