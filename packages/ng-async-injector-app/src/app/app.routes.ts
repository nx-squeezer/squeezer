import { inject } from '@angular/core';
import { Route } from '@angular/router';

import { AsyncInjector, provideAsync, provideAsyncInjector } from '@nx-squeezer/ng-async-injector';

import { FIRST_INJECTION_TOKEN } from './async-tokens/first.token';
import { SECOND_INJECTION_TOKEN } from './async-tokens/second.token';
import { SIXTH_INJECTION_TOKEN } from './async-tokens/sixth.token';
import { THIRD_INJECTION_TOKEN } from './async-tokens/third.token';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./route.component'),
    providers: [
      provideAsyncInjector(),
      provideAsync({
        provide: SIXTH_INJECTION_TOKEN,
        useAsyncValue: () => import('./async-providers/sixth.provider').then((x) => x.sixthProvider),
      }),
    ],
    resolve: {
      asyncProviders: () =>
        inject(AsyncInjector).resolveMany(
          FIRST_INJECTION_TOKEN,
          SECOND_INJECTION_TOKEN,
          THIRD_INJECTION_TOKEN,
          SIXTH_INJECTION_TOKEN
        ),
    },
  },
  { path: '**', redirectTo: '' },
];
