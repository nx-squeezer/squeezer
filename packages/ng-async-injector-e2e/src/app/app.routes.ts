import { inject } from '@angular/core';
import { Route } from '@angular/router';

import { AsyncInjector } from '@nx-squeezer/ng-async-injector';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./route.component'),
    resolve: { asyncProviders: () => inject(AsyncInjector).resolveAll() },
  },
  { path: '**', redirectTo: '' },
];
