import { inject, InjectionToken } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { InjectionTokenTypeCollection, InjectionTokenTypeMap } from '../interfaces/injection-token-type';

/**
 * `resolve` and `resolveMany` functions can be used in route resolvers to ensure that certain async providers are resolved before a route loads.
 * They could be used in other places as needed, since they return a promise that resolves when the async provider is resolved and returns its value.
 * It can be compared to Angular's `inject` function, but for async providers.
 *
 * `resolveMany` supports either a list of async provider tokens, or a map of key-value pairs with the value being the token.
 * The resolved value will have the same shape, either an array or a map of the resolved async providers.
 *
 * @example
 *
 * ```ts
 * export const routes: Route[] = [
 *   {
 *     path: '',
 *     loadComponent: () => import('./route.component'),
 *     providers: [
 *       provideAsync(
 *         {
 *           provide: CLASS_PROVIDER,
 *           useAsyncClass: () => import('./first-service').then((x) => x.FirstService),
 *         },
 *         {
 *           provide: VALUE_PROVIDER,
 *           useAsyncValue: () => import('./value').then((x) => x.value),
 *         }
 *       ),
 *     ],
 *     resolve: {
 *       asyncProviders: () => resolveMany(CLASS_PROVIDER, VALUE_PROVIDER),
 *     },
 *   }
 * ];
 * ```
 */
export function resolveMany<T extends { [key: string]: InjectionToken<unknown> }>(
  injectionTokens: T
): Promise<InjectionTokenTypeMap<T>>;
export function resolveMany<T extends InjectionToken<unknown>[]>(
  ...injectionTokens: T
): Promise<InjectionTokenTypeCollection<[...T]>>;
export function resolveMany(
  ...injectionTokens: (InjectionToken<unknown> | { [key: string]: InjectionToken<unknown> })[]
): Promise<unknown[] | { [key: string]: unknown }> {
  return inject(AsyncInjector).resolveMany(...(injectionTokens as any));
}
