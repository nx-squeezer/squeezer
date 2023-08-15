import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';

import { resolve } from '@nx-squeezer/ngx-async-injector';

import { EIGHTH_INJECTION_TOKEN } from './async-tokens/eighth.token';
import { SEVENTH_INJECTION_TOKEN } from './async-tokens/seventh.token';
import { SIXTH_INJECTION_TOKEN } from './async-tokens/sixth.token';

@Component({
  selector: 'nx-squeezer-child',
  imports: [AsyncPipe, NgIf],
  template: `
    <p>{{ fourth }}</p>
    <p>{{ fifth }}</p>
    <p>{{ sixth }}</p>
    <p *ngIf="seventhPromise | async as seventh">{{ seventh }}</p>
    <p>{{ eighth }}</p>
  `,
  standalone: true,
})
export default class ChildComponent {
  readonly sixth = inject(SIXTH_INJECTION_TOKEN);
  readonly seventhPromise = resolve(SEVENTH_INJECTION_TOKEN);
  readonly eighth = inject(EIGHTH_INJECTION_TOKEN);
  @Input() fourth!: string;
  @Input() fifth!: string;
}
