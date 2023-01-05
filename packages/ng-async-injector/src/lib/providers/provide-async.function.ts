import { StaticProvider, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { AsyncInjectionToken } from '../tokens/async-injection-token';

export function provideAsync<T>(
  injectionToken: AsyncInjectionToken<T>,
  useAsyncFactory: () => Promise<T>
): StaticProvider[] {
  return [
    { provide: injectionToken, useFactory: () => inject(AsyncInjector).get(injectionToken) },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(AsyncInjector).register(injectionToken, useAsyncFactory),
    },
  ];
}
