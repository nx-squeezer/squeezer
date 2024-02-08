/* eslint-disable deprecation/deprecation */
import { inject } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';

/**
 * Injection context for async inject function.
 */
export interface InjectionContext {
  /**
   * Inject function.
   */
  inject: typeof inject;

  /**
   * Resolve function.
   */
  resolve: AsyncInjector['resolve'];
}
