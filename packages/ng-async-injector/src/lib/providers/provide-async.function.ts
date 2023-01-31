import { StaticProvider, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { AsyncProviderTypes } from '../interfaces/async-provider-types';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';

export function provideAsync<T>(asyncStaticProvider: AsyncStaticProvider<T>): StaticProvider[];
export function provideAsync<T extends any[]>(...asyncStaticProviders: AsyncProviderTypes<[...T]>): StaticProvider[];
export function provideAsync(...asyncStaticProviders: AsyncStaticProvider<unknown>[]): StaticProvider[] {
  const asyncProviders: StaticProvider[] = asyncStaticProviders.map(
    (asyncStaticProvider: AsyncStaticProvider<unknown>) => ({
      provide: asyncStaticProvider.provide,
      useFactory: () => inject(AsyncInjector, { self: true }).get(asyncStaticProvider.provide),
    })
  );

  const initializer: StaticProvider = {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      const asyncInjector = inject(AsyncInjector, { self: true });
      asyncStaticProviders.forEach((asyncStaticProvider) => {
        asyncInjector.register(asyncStaticProvider);
      });
    },
  };

  return [{ provide: AsyncInjector }, initializer, ...asyncProviders];
}
