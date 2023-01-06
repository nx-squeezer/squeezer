import { AsyncInjectionToken } from '../tokens/async-injection-token';

export interface AsyncStaticProvider<T> {
  provide: AsyncInjectionToken<T>;
  useAsyncFactory: () => Promise<T>;

  /**
   * If `eager`, the async injector will start resolving as soon as the environment injector initializes.
   * If `lazy` (default), it will wait until the injection token is resolved.
   */
  mode?: 'lazy' | 'eager';
}
