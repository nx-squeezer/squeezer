import { StaticProvider, inject, ENVIRONMENT_INITIALIZER } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { AsyncProviderTypes } from '../interfaces/async-provider-types';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { ASYNC_INJECTOR_INITIALIZER } from '../tokens/async-injector-initializer.token';

/**
 * It is used to declare one or more async providers. For each provider, it requires the token, and then an async function that can be `useAsyncValue`, `useAsyncClass` or `useAsyncFactory`. It supports `multi` providers as well. It can be used in environment injectors, modules, components and directives. If multiple providers need to be declared in the same injector, use a single `provideAsync` function with multiple providers instead of using it multiple times.
 *
 * @example
 *
 * Example of declaring a single async provider:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAsync({
 *       provide: MY_SERVICE,
 *       useAsyncClass: () => import('./my-service').then((x) => x.MyService),
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 *
 * Example of declaring multiple providers, each one with different async functions:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAsync(
 *       {
 *         provide: CLASS_PROVIDER,
 *         useAsyncClass: () => import('./first-service').then((x) => x.FirstService),
 *       },
 *       {
 *         provide: VALUE_PROVIDER,
 *         useAsyncValue: () => import('./value').then((x) => x.value),
 *       },
 *       {
 *         provide: FACTORY_PROVIDER,
 *         useAsyncFactory: () => import('./factory').then((x) => x.providerFactory),
 *       }
 *     ),
 *   ],
 * });
 *
 * // first-service.ts
 * export class FirstService {}
 *
 * // value.ts
 * export const value = 'value';
 *
 * // factory.ts
 * export async function providerFactory() {
 *   return await Promise.resolve('value');
 * }
 * ```
 *
 * @example
 *
 * Multi providers can also be declared as it happens with Angular:
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAsync(
 *       {
 *         provide: VALUE_PROVIDER,
 *         useAsyncValue: () => import('./first-value').then((x) => x.value),
 *         multi: true
 *       },
 *       {
 *         provide: VALUE_PROVIDER,
 *         useAsyncValue: () => import('./second-value').then((x) => x.value),
 *         multi: true
 *       },
 *     ),
 *   ],
 * });
 * ```
 *
 * @example
 *
 * Finally, the lazy load behavior can be controlled by the `mode` flag. By default it is `lazy`, which means it won't be resolved until requested. `eager` on the contrary will trigger the load on declaration, even though resolvers are still needed to wait for completion. Example:
 *
 *```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideAsync(
 *       {
 *         provide: VALUE_PROVIDER,
 *         useAsyncValue: () => import('./first-value').then((x) => x.value),
 *         mode: 'eager'
 *       },
 *     ),
 *   ],
 * });
 * ```
 *
 * @example
 *
 * When using a factory provider, the function itself can be async. Regular `inject` function from Angular can be used before executing any async code since the injection context is preserved, however it can't be used afterwards. To solve that problem, and also to protect against cyclic dependencies between async providers, the factory provider function is called with a context that exposes two functions that are self explanatory, `inject` and `resolve`. Example:
 *
 * ```ts
 * import { InjectionContext } from '@nx-squeezer/ngx-async-injector';
 *
 * export async function providerFactory({ inject, resolve }: InjectionContext): Promise<string> {
 *   const firstString = await resolve(FIRST_INJECTION_TOKEN);
 *   const secondString = inject(SECOND_INJECTION_TOKEN);
 *   return `${firstString} ${secondString}`;
 * }
 * ```
 */
export function provideAsync<T>(asyncStaticProvider: AsyncStaticProvider<T>): StaticProvider[];
/**
 * Overload for a collection of async providers.
 */
export function provideAsync<T extends unknown[]>(
  ...asyncStaticProviders: AsyncProviderTypes<[...T]>
): StaticProvider[];
/**
 * Base implementation.
 */
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
