import { Injectable } from '@angular/core';

import { SignalControlContainer } from '../directives/signal-control-container.directive';

/**
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class SignalControlContainerRegistry {
  key: string | number | null = null;
  controlContainer: SignalControlContainer<any> | null = null;
}
