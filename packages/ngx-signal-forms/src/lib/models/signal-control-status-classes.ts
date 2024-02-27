import { SignalControlStatus } from './signal-control-status';

/**
 * Type to define all CSS classes automatically added by the control directive.
 */
export type SignalControlStatusClasses = {
  readonly [key in Lowercase<SignalControlStatus> | 'pristine' | 'dirty' | 'touched' | 'untouched']: string;
};
