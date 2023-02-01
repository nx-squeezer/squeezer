import { inject, InjectionToken } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { InjectionTokenTypeCollection, InjectionTokenTypeMap } from '../interfaces/injection-token-type';

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
