import { SignalControlStatus } from './signal-control-status';

/**
 * @internal
 */
export type SignalControlStatusClasses = {
  [key in Lowercase<SignalControlStatus> | 'pristine' | 'dirty']: string;
};

/**
 * @internal
 */
export const SignalControlStatusClasses: SignalControlStatusClasses = {
  valid: 'ngx-valid',
  invalid: 'ngx-invalid',
  pristine: 'ngx-pristine',
  dirty: 'ngx-dirty',
};
