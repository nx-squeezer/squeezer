import { InjectionToken } from '@angular/core';

export type InjectionTokenType<T extends InjectionToken<any>> = T extends InjectionToken<infer R> ? R : never;

export type InjectionTokenTypes<T extends InjectionToken<any>[]> = {
  [K in keyof T]: InjectionTokenType<T[K]>;
};
