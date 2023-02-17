import { inject, InjectionToken } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';

export const resolve: AsyncInjector['resolve'] = <T>(injectionToken: InjectionToken<T>): Promise<T> => {
  return inject(AsyncInjector).resolve(injectionToken);
};
