import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'nx-squeezer-root',
  template: '<h1>Welcome</h1><router-outlet/>',
})
export class AppComponent {
  title = 'ngx-signal-forms-app';
}
