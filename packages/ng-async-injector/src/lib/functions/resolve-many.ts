import { inject, InjectionToken } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { InjectionTokenTypeCollection, InjectionTokenTypeMap } from '../interfaces/injection-token-type';

export function resolveMany<T extends { [key: string]: InjectionToken<any> }>(
  injectionTokens: T
): Promise<InjectionTokenTypeMap<T>>;
export function resolveMany<T extends InjectionToken<any>[]>(
  ...injectionTokens: T
): Promise<InjectionTokenTypeCollection<[...T]>>;
export function resolveMany(
  ...injectionTokens: (InjectionToken<any> | { [key: string]: InjectionToken<any> })[]
): Promise<any[] | { [key: string]: any }> {
  return inject(AsyncInjector).resolveMany(...(injectionTokens as any));
}
