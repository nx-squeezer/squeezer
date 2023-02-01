import { InjectionToken } from '@angular/core';

export type InjectionTokenType<T extends InjectionToken<unknown>> = T extends InjectionToken<infer R> ? R : never;

export type InjectionTokenTypeCollection<T extends InjectionToken<unknown>[]> = {
  [K in keyof T]: InjectionTokenType<T[K]>;
};

export type InjectionTokenTypeMap<T extends { [key: string]: InjectionToken<unknown> }> = {
  [K in keyof T]: InjectionTokenType<T[K]>;
};
