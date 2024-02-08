import { InjectionToken } from '@angular/core';

/**
 * Configuration of an async provider.
 */
export interface AsyncProviderConfig<T> {
  /**
   * Token to be provided.
   */
  provide: InjectionToken<T>;

  /**
   * If `eager`, the async injector will start resolving as soon as the environment injector initializes.
   * If `lazy` (default), it will wait until the injection token is resolved.
   */
  mode?: 'lazy' | 'eager';
}
