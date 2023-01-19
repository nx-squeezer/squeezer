import { InjectionToken } from '@angular/core';

export const FIRST_INJECTION_TOKEN = new InjectionToken<number>('first');

export const firstInjectionTokenValue = () => Promise.resolve(1);
