import { Route } from '@angular/router';

import { provideAsync, resolveMany } from '@nx-squeezer/ngx-async-injector';

import { FIRST_INJECTION_TOKEN } from './async-tokens/first.token';
import { MULTI_INJECTION_TOKEN } from './async-tokens/multi-provider.token';
import { SECOND_INJECTION_TOKEN } from './async-tokens/second.token';
import { SEVENTH_INJECTION_TOKEN } from './async-tokens/seventh.token';
import { SIXTH_INJECTION_TOKEN } from './async-tokens/sixth.token';
import { THIRD_INJECTION_TOKEN } from './async-tokens/third.token';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./route.component'),
    providers: [
      provideAsync(
        {
          provide: MULTI_INJECTION_TOKEN,
          useAsyncValue: () => import('./async-providers/multi.provider').then((x) => x.multiProvider),
          multi: true,
        },
        {
          provide: MULTI_INJECTION_TOKEN,
          useAsyncValue: () => import('./async-providers/multi.provider').then((x) => x.multiProvider),
          multi: true,
        },
        {
          provide: SIXTH_INJECTION_TOKEN,
          useAsyncValue: () => import('./async-providers/sixth.provider').then((x) => x.sixthProvider),
        },
        {
          provide: SEVENTH_INJECTION_TOKEN,
          useAsyncValue: () => import('./async-providers/seventh.provider').then((x) => x.seventhProvider),
        }
      ),
    ],
    resolve: {
      asyncProviders: () =>
        resolveMany(
          FIRST_INJECTION_TOKEN,
          SECOND_INJECTION_TOKEN,
          THIRD_INJECTION_TOKEN,
          SIXTH_INJECTION_TOKEN,
          MULTI_INJECTION_TOKEN
        ),
    },
  },
  { path: '**', redirectTo: '' },
];
