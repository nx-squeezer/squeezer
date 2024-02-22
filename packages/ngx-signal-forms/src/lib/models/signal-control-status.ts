export type SignalControlStatus = 'VALID' | 'INVALID';

export type SignalControlStatusClasses = {
  [key in Lowercase<SignalControlStatus>]: string;
};
