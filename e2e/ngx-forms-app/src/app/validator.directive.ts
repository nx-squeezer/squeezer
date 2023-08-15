import { Directive } from '@angular/core';

import { provideLazyValidator } from '@nx-squeezer/ngx-forms';

@Directive({
  selector: '[nxSqueezerValidator]',
  standalone: true,
  providers: [provideLazyValidator(() => import('./validator'))],
})
export class ValidatorDirective {}
