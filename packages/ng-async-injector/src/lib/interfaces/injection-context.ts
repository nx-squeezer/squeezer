import { inject } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';

export interface InjectionContext {
  // eslint-disable-next-line @delagen/deprecation/deprecation
  inject: typeof inject;
  resolve: AsyncInjector['resolve'];
}
