import { Component, inject } from '@angular/core';

import { provideAsync, ResolveAsyncProvidersDirective } from '@nx-squeezer/ng-async-injector';

import { EIGHTH_INJECTION_TOKEN } from './async-tokens/eighth.token';
import { FIFTH_INJECTION_TOKEN } from './async-tokens/fifth.token';
import { FIRST_INJECTION_TOKEN } from './async-tokens/first.token';
import { FOURTH_INJECTION_TOKEN } from './async-tokens/fourth.token';
import { SECOND_INJECTION_TOKEN } from './async-tokens/second.token';
import { THIRD_INJECTION_TOKEN } from './async-tokens/third.token';
import ChildComponent from './child.component';

@Component({
  providers: [
    provideAsync({
      provide: EIGHTH_INJECTION_TOKEN,
      useAsyncValue: () => import('./async-providers/eighth.provider').then((x) => x.eighthProvider),
    }),
  ],
  imports: [ResolveAsyncProvidersDirective, ChildComponent],
  template: `
    <p>{{ first }}</p>
    <p>{{ second }}</p>
    <p>{{ third.value }}</p>
    <nx-squeezer-child
      *ngxResolveAsyncProviders="
        { fourth: FOURTH_INJECTION_TOKEN, fifth: FIFTH_INJECTION_TOKEN, eighth: EIGHTH_INJECTION_TOKEN };
        let providers;
        fourth as fourth
      "
      [fourth]="fourth"
      [fifth]="providers.fifth"
    />
  `,
  standalone: true,
})
export default class RouteComponent {
  readonly first = inject(FIRST_INJECTION_TOKEN);
  readonly second = inject(SECOND_INJECTION_TOKEN);
  readonly third = inject(THIRD_INJECTION_TOKEN);
  readonly FOURTH_INJECTION_TOKEN = FOURTH_INJECTION_TOKEN;
  readonly FIFTH_INJECTION_TOKEN = FIFTH_INJECTION_TOKEN;
  readonly EIGHTH_INJECTION_TOKEN = EIGHTH_INJECTION_TOKEN;
}
