import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: 'home', loadComponent: () => import('./components/home.component') },
  { path: '**', redirectTo: 'home' },
];
