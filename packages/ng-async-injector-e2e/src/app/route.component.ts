import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { FIRST_INJECTION_TOKEN } from './async-tokens/first.token';

@Component({
  imports: [JsonPipe],
  template: `
    <ul>
      <li>{{ first | json }}</li>
    </ul>
  `,
  standalone: true,
})
export default class RouteComponent {
  readonly first = inject(FIRST_INJECTION_TOKEN);
}
