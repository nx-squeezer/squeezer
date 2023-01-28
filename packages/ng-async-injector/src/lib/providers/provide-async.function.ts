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
        useFactory: () => inject(AsyncInjector, { self: true }).get(asyncStaticProvider.provide),
      },
      {
        provide: ENVIRONMENT_INITIALIZER,
        multi: true,
        useValue: () => {
          const injector = inject(AsyncInjector, { self: true, optional: true });
          if (injector == null) {
            throw new Error(
              `Trying to register async injection token, but async injector does not exist. ` +
                `Use provideAsyncInjector() in the same provider list as where you defined child ${asyncStaticProvider.provide.toString()}`
            );
          }

          return injector.register(asyncStaticProvider);
        },
      },
    ])
    .flat();
}
