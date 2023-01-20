import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideAsync } from '@nx-squeezer/ng-async-injector';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { FIFTH_INJECTION_TOKEN } from './app/async-tokens/fifth.token';
import { FIRST_INJECTION_TOKEN } from './app/async-tokens/first.token';
import { FOURTH_INJECTION_TOKEN } from './app/async-tokens/fourth.token';
import { SECOND_INJECTION_TOKEN } from './app/async-tokens/second.token';
import { THIRD_INJECTION_TOKEN } from './app/async-tokens/third.token';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideAsync(
      {
        provide: FIRST_INJECTION_TOKEN,
        useAsyncValue: () => import('./app/async-providers/first.provider').then((x) => x.firstProvider),
      },
      {
        provide: SECOND_INJECTION_TOKEN,
        useAsyncFactory: () => import('./app/async-providers/second.provider').then((x) => x.secondProviderFactory),
      },
      {
        provide: THIRD_INJECTION_TOKEN,
        useAsyncClass: () => import('./app/async-providers/third.provider').then((x) => x.ThirdProvider),
      },
      {
        provide: FOURTH_INJECTION_TOKEN,
        useAsyncValue: () => import('./app/async-providers/fourth.provider').then((x) => x.fourthProvider),
      },
      {
        provide: FIFTH_INJECTION_TOKEN,
        useAsyncValue: () => import('./app/async-providers/fifth.provider').then((x) => x.fifthProvider),
      }
    ),
  ],
});
