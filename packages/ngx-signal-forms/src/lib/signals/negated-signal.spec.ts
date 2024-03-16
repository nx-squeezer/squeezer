import { signal, WritableSignal } from '@angular/core';

import { negatedSignal } from './negated-signal';

describe('negateSignal', () => {
  let source: WritableSignal<boolean>;
  let negated: WritableSignal<boolean>;

  beforeEach(() => {
    source = signal(false);
    negated = negatedSignal(() => source);
  });

  it('should have negated values', () => {
    expect(source()).toBeFalsy();
    expect(negated()).toBeTruthy();
  });

  it('should reflect changes in source signal', () => {
    source.set(true);

    expect(source()).toBeTruthy();
    expect(negated()).toBeFalsy();
  });

  it('should reflect changes in negated signal', () => {
    negated.set(false);

    expect(source()).toBeTruthy();
    expect(negated()).toBeFalsy();
  });
});
