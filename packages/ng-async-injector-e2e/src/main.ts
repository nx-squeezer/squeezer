import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideAsync } from '@nx-squeezer/ng-async-injector';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { firstInjectionTokenValue, FIRST_INJECTION_TOKEN } from './app/async-tokens/first.token';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideAsync({ provide: FIRST_INJECTION_TOKEN, useAsyncValue: firstInjectionTokenValue }),
  ],
});
