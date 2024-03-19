import { Signal } from '@angular/core';

import { SignalControlDirective } from '../directives/signal-control.directive';

/**
 * Injection token for an abstract signal control container to avoid cyclic dependencies.
 * @internal
 */
export abstract class AbstractSignalControlContainer<TValue extends object> {
  abstract activeKey: string | number | null;
  abstract readonly path: Signal<string | null>;
  abstract addControl<K extends keyof TValue>(key: K, signalControlDirective: SignalControlDirective<TValue[K]>): void;
  abstract removeControl<K extends keyof TValue>(key: K): void;
}
