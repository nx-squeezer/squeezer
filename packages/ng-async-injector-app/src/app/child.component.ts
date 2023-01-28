import { Component, inject, Input } from '@angular/core';

import { SIXTH_INJECTION_TOKEN } from './async-tokens/sixth.token';

@Component({
  selector: 'nx-squeezer-child',
  template: `
    <p>{{ fourth }}</p>
    <p>{{ fifth }}</p>
    <p>{{ sixth }}</p>
  `,
  standalone: true,
})
export default class ChildComponent {
  readonly sixth = inject(SIXTH_INJECTION_TOKEN);
  @Input() fourth!: string;
  @Input() fifth!: string;
}
