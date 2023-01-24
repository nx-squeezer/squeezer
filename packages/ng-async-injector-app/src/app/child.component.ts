import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-squeezer-child',
  template: `
    <p>{{ fourth }}</p>
    <p>{{ fifth }}</p>
  `,
  standalone: true,
})
export default class ChildComponent {
  @Input() fourth!: string;
  @Input() fifth!: string;
}
