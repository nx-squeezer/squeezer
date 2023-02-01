import { StaticProvider, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { AsyncProviderTypes } from '../interfaces/async-provider-types';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { ASYNC_INJECTOR_INITIALIZER } from '../tokens/async-injector-initializer.token';

export function provideAsync<T>(asyncStaticProvider: AsyncStaticProvider<T>): StaticProvider[];
export function provideAsync<T extends any[]>(...asyncStaticProviders: AsyncProviderTypes<[...T]>): StaticProvider[];
export function provideAsync(...asyncStaticProviders: AsyncStaticProvider<unknown>[]): StaticProvider[] {
  const asyncProviders: StaticProvider[] = asyncStaticProviders.map(
    (asyncStaticProvider: AsyncStaticProvider<unknown>) => ({
      provide: asyncStaticProvider.provide,
      useFactory: () => inject(AsyncInjector, { self: true }).get(asyncStaticProvider.provide),
    })
  );

  const envInitializer: StaticProvider = {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      inject(ASYNC_INJECTOR_INITIALIZER, { self: true });
    },
  };

  const asyncInitializer: StaticProvider = {
    provide: ASYNC_INJECTOR_INITIALIZER,
    useFactory: () => {
      const asyncInjector = inject(AsyncInjector, { self: true });
      asyncInjector.init(...asyncStaticProviders);
    },
  };

  return [{ provide: AsyncInjector }, envInitializer, asyncInitializer, ...asyncProviders];
}
