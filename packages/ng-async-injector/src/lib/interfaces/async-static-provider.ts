import { InjectionToken } from '@angular/core';

export interface AsyncStaticProvider<T> {
  provide: InjectionToken<T>;
  useValueFactory: () => Promise<T>;

  /**
   * If `eager`, the async injector will start resolving as soon as the environment injector initializes.
   * If `lazy` (default), it will wait until the injection token is resolved.
   */
  mode?: 'lazy' | 'eager';
}
