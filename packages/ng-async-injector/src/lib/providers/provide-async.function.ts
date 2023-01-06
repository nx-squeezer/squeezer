import { StaticProvider, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';

export function provideAsync<T>(asyncStaticProvider: AsyncStaticProvider<T>): StaticProvider[] {
  const { provide: injectionToken } = asyncStaticProvider;

  return [
    { provide: injectionToken, useFactory: () => inject(AsyncInjector).get(injectionToken) },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(AsyncInjector).register(asyncStaticProvider),
    },
  ];
}
