import { inject, InjectionToken } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';

/**
 * `resolve` and `resolveMany` functions can be used in route resolvers to ensure that certain async providers are resolved before a route loads.
 * They could be used in other places as needed, since they return a promise that resolves when the async provider is resolved and returns its value.
 * It can be compared to Angular's `inject` function, but for async providers.
 *
 * @example
 *
 * ```ts
 * export const routes: Route[] = [
 *   {
 *     path: '',
 *     loadComponent: () => import('./route.component'),
 *     providers: [
 *       provideAsync({
 *         provide: VALUE_PROVIDER,
 *         useAsyncValue: () => import('./value').then((x) => x.value),
 *       }),
 *     ],
 *     resolve: {
 *       asyncProviders: () => resolve(VALUE_PROVIDER),
 *     },
 *   }
 * ];
 * ```
 */
export const resolve: AsyncInjector['resolve'] = <T>(injectionToken: InjectionToken<T>): Promise<T> => {
  return inject(AsyncInjector).resolve(injectionToken);
};
