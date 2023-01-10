import { InjectionToken } from '@angular/core';

export type InjectionTokenType<T extends InjectionToken<any>> = T extends InjectionToken<infer R> ? R : never;

export type InjectionTokenTypeCollection<T extends InjectionToken<any>[]> = {
  [K in keyof T]: InjectionTokenType<T[K]>;
};

export type InjectionTokenTypeMap<T extends { [key: string]: InjectionToken<any> }> = {
  [K in keyof T]: InjectionTokenType<T[K]>;
};
