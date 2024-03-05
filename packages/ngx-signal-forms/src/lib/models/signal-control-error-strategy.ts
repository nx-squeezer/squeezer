import { SignalControlDirective } from '../directives/signal-control.directive';

/**
 * Generic strategy to display form errors based on their status.
 */
export type SignalControlErrorStrategy = (control: SignalControlDirective<any, any>) => boolean;
