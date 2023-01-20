import { inject } from '@angular/core';
import { Route } from '@angular/router';

import { AsyncInjector } from '@nx-squeezer/ng-async-injector';

import { FIRST_INJECTION_TOKEN } from './async-tokens/first.token';
import { SECOND_INJECTION_TOKEN } from './async-tokens/second.token';
import { THIRD_INJECTION_TOKEN } from './async-tokens/third.token';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./route.component'),
    resolve: {
      asyncProviders: () =>
        inject(AsyncInjector).resolveMany(FIRST_INJECTION_TOKEN, SECOND_INJECTION_TOKEN, THIRD_INJECTION_TOKEN),
    },
  },
  { path: '**', redirectTo: '' },
];
