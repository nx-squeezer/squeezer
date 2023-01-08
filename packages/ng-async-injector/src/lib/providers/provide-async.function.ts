import { StaticProvider, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { AsyncProviderTypes } from '../interfaces/async-provider-types';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';

export function provideAsync<T>(asyncStaticProvider: AsyncStaticProvider<T>): StaticProvider[];
export function provideAsync<T extends any[]>(...asyncStaticProviders: AsyncProviderTypes<[...T]>): StaticProvider[];
export function provideAsync(...asyncStaticProviders: AsyncStaticProvider<unknown>[]): StaticProvider[] {
  return asyncStaticProviders
    .map((asyncStaticProvider: AsyncStaticProvider<unknown>) => [
      {
        provide: asyncStaticProvider.provide,
        useFactory: () => inject(AsyncInjector).get(asyncStaticProvider.provide),
      },
      {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useValue: () => inject(AsyncInjector).register(asyncStaticProvider),
      },
    ])
    .flat();
}
