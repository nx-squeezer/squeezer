import { SignalControlDirective } from '../directives/signal-control.directive';

/**
 * Injection token for an abstract signal control container
 * @internal
 */
export abstract class AbstractSignalControlContainer<TValue extends object> {
  abstract addControl<K extends keyof TValue>(key: K, signalControlDirective: SignalControlDirective<TValue[K]>): void;
  abstract removeControl<K extends keyof TValue>(key: K): void;
}
