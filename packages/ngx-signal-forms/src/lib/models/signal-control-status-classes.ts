import { SignalControlStatus } from './signal-control-status';

export type SignalControlStatusClasses = {
  [key in Lowercase<SignalControlStatus> | 'pristine' | 'dirty']: string;
};

export const SignalControlStatusClasses: SignalControlStatusClasses = {
  valid: 'ngx-valid',
  invalid: 'ngx-invalid',
  pristine: 'ngx-pristine',
  dirty: 'ngx-dirty',
};
