import { SignalControlStatus } from './signal-control-status';

export type SignalControlStatusClasses = {
  [key in Lowercase<SignalControlStatus>]: string;
};
