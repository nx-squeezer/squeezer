import { JsonPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-squeezer-child',
  imports: [JsonPipe],
  template: `
    <p>{{ fourth | json }}</p>
    <p>{{ fifth | json }}</p>
  `,
  standalone: true,
})
export default class ChildComponent {
  @Input() fourth!: number;
  @Input() fifth!: number;
}
